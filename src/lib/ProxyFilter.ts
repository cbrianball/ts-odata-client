import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { Expression, TypedExpression } from "./Expression";
import { ExpressionOperator } from "./ExpressionOperator";
import { FieldReference } from "./FieldReference";
import { ODataQuery } from "./ODataQuery";
import { SubType } from "./SubType";

// goal for ProxyFilter:
// query<User>.filter(u => u.firstName.startsWith('efg'))
// query<User>filter((u,compound) => compound.and(u.firstName.equals('John'), compound.or(u.lastName.endsWith('th'), u.age.lessThan(60))))
// slightly cleaner with destructuring
// quer<User>filter((u, {and, or}) => and(u.firstName.equals('John'), or(u.lastName.endsWith('th'), u.age.lessThan(60))))

interface User {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    dob: Date;
}

// interface StringFilterProxy {
//     equals(value: string): any;
//     startsWith(value: string): any;
//     endsWith(value: string): any;
//     contains(value: string): any;
// }

// interface NumberFilterProxy {
//     equals(value: number): any;
//     greaterThan(value: number): any;
//     lessThan(value: number): any;
// }

const propertyPathSymbol = Symbol();

type FieldsFor<T> = Extract<keyof T, string>;

type EntityProxy<T> = {
    [P in FieldsFor<T>]: PropertyProxy<T[P]>
};

type PropertyProxy<T> = EntityProxy<T> & {
    $is: T extends string ? StringProxyFieldReference : ProxyFieldReference<T>;
    [propertyPathSymbol]: string[];
}

type ProxyPredicateBuilder<T> = {
    [P in FieldsFor<SubType<T, number>>]: ProxyFieldReference<number>; 
} &
{
    [P in FieldsFor<SubType<T, string>>]: StringProxyFieldReference; 
};

export class ProxyFieldReference<P> {
    private readonly fieldReference: FieldReference<P>;
    constructor(private readonly propertyProxy: PropertyProxy<P>) {
        this.fieldReference = this.getFieldReference(propertyProxy);
     }

    equalTo(value: P | PropertyProxy<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Equals);
    }

    lessThan(value: P | PropertyProxy<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThan);
    }

    lessThanOrEqualTo(value: P | PropertyProxy<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThanOrEqualTo);
    }

    greaterThan(value: P | PropertyProxy<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThan);
    }

    greaterThanOrEqualTo(value: P | PropertyProxy<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThanOrEqualTo);
    }

    notEqualTo(value: P | PropertyProxy<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.NotEquals);
    }

    protected buildPredicateBuilder(value: P | PropertyProxy<P>, operator: ExpressionOperator) {        
        let operand: any = value;
        const propertyPath = (value as any)[propertyPathSymbol] as string[] | undefined;
        if(propertyPath != null) {
            operand = this.getFieldReference(value as PropertyProxy<P>)
        }        
        const expression = new Expression(operator, [this.fieldReference, operand]);
        return new BooleanPredicateBuilder<P>(expression);
    }

    private getFieldReference(propertyProxy: PropertyProxy<P>) {
        const propertyPath = propertyProxy[propertyPathSymbol];
        // TODO: Better handle typing here
        return new FieldReference(propertyPath.join('/')) as unknown as FieldReference<P>;
    }
}

export class StringProxyFieldReference extends ProxyFieldReference<string> {
    containing(value: string | PropertyProxy<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Contains);
    }

    startingWith(value: string | PropertyProxy<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.StartsWith);
    }

    endingWith(value: string | PropertyProxy<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.EndsWith);
    }
}

function usingProxy<T>(entity: ((entity: EntityProxy<T>/*, compound: ProxyBooleanPredicates<T>*/) => BooleanPredicateBuilder<T>)): BooleanPredicateBuilder<T> {
    const test = {} as unknown as EntityProxy<T>;
    // const baz = {} as unknown as ProxyBooleanPredicates<T>;
    return entity(test/*, baz*/);
}

interface ProxyBooleanPredicates<T> {
    and(predicate: BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
    or(predicate: BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
}


const foo = {} as unknown as ODataQuery<User>;

//options for filter:
foo.filter(u => u.equals('id', 10).and(u.lessThan('lastName', u.fieldReference('firstName'))));
foo.filter(usingProxy(u => u.id.$is.equalTo(10).and(u.lastName.$is.lessThan(u.firstName))));


function getEntityProxy<T>(): EntityProxy<T> {    
    return new Proxy({},{
        get(target: any, property: string) {
            return getPropertyProxy([property]);
        }
    });
}

function getPropertyProxy<T>(navigationPath: string[]): PropertyProxy<T>  {    
    if(navigationPath.length === 0) throw new Error('PropertyProxy must be initialized with at least one proprety path');
    return new Proxy({[propertyPathSymbol]: navigationPath},{
        get(target: any, property: string) {
            if(property === "$is") return new ProxyFieldReference<T>(target as PropertyProxy<T>);
            return getPropertyProxy([...navigationPath, property]);
        }
    });
}