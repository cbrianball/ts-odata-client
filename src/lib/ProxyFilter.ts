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

type FieldsFor<T> = Extract<keyof T, string>;

type ProxyPredicateBuilder<T> = {
    [P in FieldsFor<SubType<T, number>>]: ProxyFieldReference<number>; 
} &
{
    [P in FieldsFor<SubType<T, string>>]: StringProxyFieldReference; 
};

export class ProxyFieldReference<P> {
    constructor(private readonly fieldReference: FieldReference<P>) { }

    equals(value: P | ProxyFieldReference<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Equals);
    }

    lessThan(value: P | ProxyFieldReference<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThan);
    }

    lessThanOrEqualTo(value: P | ProxyFieldReference<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThanOrEqualTo);
    }

    greaterThan(value: P | ProxyFieldReference<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThan);
    }

    greaterThanOrEqualTo(value: P | ProxyFieldReference<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThanOrEqualTo);
    }

    notEquals(value: P | ProxyFieldReference<P>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.NotEquals);
    }

    protected buildPredicateBuilder(value: P | ProxyFieldReference<P>, operator: ExpressionOperator) {
        const operand: any = value instanceof ProxyFieldReference ? value.fieldReference : value;
        const expression = new Expression(operator, [this.fieldReference, operand]);
        return new BooleanPredicateBuilder<P>(expression);
    }    
}

export class StringProxyFieldReference extends ProxyFieldReference<string> {
    contains(value: string | ProxyFieldReference<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Contains);
    }

    startsWith(value: string | ProxyFieldReference<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.StartsWith);
    }

    endsWith(value: string | ProxyFieldReference<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.EndsWith);
    }
}

function filter(entity: ProxyPredicateBuilder<User>) : BooleanPredicateBuilder<User> {
    return entity.firstName.greaterThan(entity.lastName).and(entity.id.lessThan(100));
}

function usingProxy<T>(entity: ((entity: ProxyPredicateBuilder<T>, compound: ProxyBooleanPredicates<T>) => BooleanPredicateBuilder<T>)): BooleanPredicateBuilder<T> {
    const test = {} as unknown as ProxyPredicateBuilder<T>;
    const baz = {} as unknown as ProxyBooleanPredicates<T>;
    return entity(test, baz);
}

interface ProxyBooleanPredicates<T> {
    and(predicate: BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
    or(predicate: BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
}


const foo = {} as unknown as ODataQuery<User>;

//options for filter:
foo.filter(u => u.equals('id', 10).and(u.lessThan('lastName', u.fieldReference('firstName'))));
foo.filter(usingProxy(u => u.id.equals(10).and(u.lastName.lessThan(u.firstName))));
