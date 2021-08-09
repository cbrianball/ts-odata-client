import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { Expression, TypedExpression } from "./Expression";
import { ExpressionOperator } from "./ExpressionOperator";
import { FieldReference } from "./FieldReference";
import { ODataQuery } from "./ODataQuery";
import { SubType } from "./SubType";

interface User extends Object {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    dob: Date;
}

const propertyPathSymbol = Symbol();

type FieldsFor<T> = Extract<keyof T, string>;

type FooFieldsFor<T> = Extract<
    T extends number ? Exclude<keyof T, keyof number> :
    T extends string ? Exclude<keyof T, keyof string> :
    T extends Date ? Exclude<keyof T, keyof Date> :
    T extends Array<any> ? Exclude<keyof T, keyof Array<any>> :
    T extends Object ? Exclude<keyof T, keyof Object> :
    keyof T, string>;

type EntityProxy<T> = {
    [P in FooFieldsFor<T>]: PropertyProxy<T[P]>
};

type PropertyProxy<T> = EntityProxy<T> & {
    $is: T extends boolean ? BooleanProxyFieldPredicate :
    T extends number ? NumberProxyFieldPredicate :
    T extends string ? StringProxyFieldPredicate :
    // TODO: Date, Array
    never;
    [propertyPathSymbol]: string[];
}

// type ProxyPredicateBuilder<T> = {
//     [P in FieldsFor<SubType<T, number>>]: ProxyFieldReference<number>; 
// } &
// {
//     [P in FieldsFor<SubType<T, string>>]: StringProxyFieldReference; 
// };

export class ProxyFieldPredicate<T> implements
    EqualityProxyFieldPredicate<T>,
    InequalityProxyFieldPredicate<T>,
    StringProxyFieldPredicateInterface {
    private readonly fieldReference: FieldReference<T>;
    constructor(private readonly propertyProxy: PropertyProxy<T>) {
        this.fieldReference = this.getFieldReference(propertyProxy);
    }

    equalTo(value: T | PropertyProxy<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Equals);
    }

    lessThan(value: T | PropertyProxy<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThan);
    }

    lessThanOrEqualTo(value: T | PropertyProxy<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThanOrEqualTo);
    }

    greaterThan(value: T | PropertyProxy<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThan);
    }

    greaterThanOrEqualTo(value: T | PropertyProxy<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThanOrEqualTo);
    }

    notEqualTo(value: T | PropertyProxy<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.NotEquals);
    }

    containing(value: string | PropertyProxy<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Contains);
    }

    startingWith(value: string | PropertyProxy<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.StartsWith);
    }

    endingWith(value: string | PropertyProxy<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.EndsWith);
    }

    protected buildPredicateBuilder<P>(value: P | PropertyProxy<P>, operator: ExpressionOperator) {
        let operand: any = value;
        const propertyPath = (value as any)[propertyPathSymbol] as string[] | undefined;
        if (propertyPath != null) {
            operand = this.getFieldReference(value as unknown as PropertyProxy<T>)
        }
        const expression = new Expression(operator, [this.fieldReference, operand]);
        return new BooleanPredicateBuilder<P>(expression);
    }

    private getFieldReference(propertyProxy: PropertyProxy<T>) {
        const propertyPath = propertyProxy[propertyPathSymbol];
        // TODO: Better handle typing here
        return new FieldReference(propertyPath.join('/')) as unknown as FieldReference<T>;
    }
}


interface EqualityProxyFieldPredicate<T> {
    equalTo(value: T | PropertyProxy<T>): BooleanPredicateBuilder<T>;
    notEqualTo(value: T | PropertyProxy<T>): BooleanPredicateBuilder<T>;
}

interface InequalityProxyFieldPredicate<T> {
    lessThan(value: T | PropertyProxy<T>): BooleanPredicateBuilder<T>;
    lessThanOrEqualTo(value: T | PropertyProxy<T>): BooleanPredicateBuilder<T>;
    greaterThan(value: T | PropertyProxy<T>): BooleanPredicateBuilder<T>;
    greaterThanOrEqualTo(value: T | PropertyProxy<T>): BooleanPredicateBuilder<T>;
}

interface BooleanProxyFieldPredicate extends EqualityProxyFieldPredicate<boolean> { };
interface NumberProxyFieldPredicate extends EqualityProxyFieldPredicate<number>, InequalityProxyFieldPredicate<number> { };

/**
 * This only exists as something for the @type {ProxyFieldPredicate} to implement.
 * If it tried to implement @type {StringProxyFieldReference} directly, then TypeScript complains.
 */
interface StringProxyFieldPredicateInterface {
    containing(value: string | PropertyProxy<string>): BooleanPredicateBuilder<string>;
    startingWith(value: string | PropertyProxy<string>): BooleanPredicateBuilder<string>;
    endingWith(value: string | PropertyProxy<string>): BooleanPredicateBuilder<string>;
}

interface StringProxyFieldPredicate extends EqualityProxyFieldPredicate<string>, InequalityProxyFieldPredicate<string>, StringProxyFieldPredicateInterface { }



function usingProxy<T>(entity: ((entity: EntityProxy<T>, compound: ProxyBooleanFunctions<T>) => BooleanPredicateBuilder<T>)): BooleanPredicateBuilder<T> {
    const proxy = getEntityProxy<T>();
    const proxyFunctions = new ProxyBooleanFunctions<T>();
    return entity(proxy, proxyFunctions);
}

const foo = {} as unknown as ODataQuery<User>;

//options for filter:
foo.filter(u => u.equals('id', 10).and(u.lessThan('lastName', u.fieldReference('firstName'))));
foo.filter(usingProxy(u => u.id.$is.equalTo(10).and(u.lastName.$is.lessThan(u.firstName))));
foo.filter(usingProxy((u, {not}) => not(u.id.$is.greaterThanOrEqualTo(12))));

function getEntityProxy<T>(): EntityProxy<T> {
    return new Proxy({}, {
        get(_: any, property: string) {
            return getPropertyProxy([property]);
        }
    });
}

function getPropertyProxy<T>(navigationPath: string[]): PropertyProxy<T> {
    if (navigationPath.length === 0) throw new Error('PropertyProxy must be initialized with at least one proprety path');
    return new Proxy({ [propertyPathSymbol]: navigationPath }, {
        get(target: any, property: string) {
            if (property === "$is") return new ProxyFieldPredicate<T>(target as PropertyProxy<T>);
            return getPropertyProxy([...navigationPath, property]);
        }
    });
}

class ProxyBooleanFunctions<T> {
    constructor() {
        // Ensure the methods are bound to this object;
        // Even if they become detatched (e.g., destructuring)
        this.and = this.and.bind(this);
        this.or = this.or.bind(this);
        this.not = this.not.bind(this);
    }

    and(...predicates: BooleanPredicateBuilder<T>[]) {
        return this.combinePredicates(ExpressionOperator.And, ...predicates);
    }

    or(...predicates: BooleanPredicateBuilder<T>[]) {
        return this.combinePredicates(ExpressionOperator.Or, ...predicates);
    }

    not(predicate: BooleanPredicateBuilder<T>) {
        return new BooleanPredicateBuilder<T>(new Expression(ExpressionOperator.Not, [], predicate.expression));
    }

    private combinePredicates(operator: ExpressionOperator, ...predicates: BooleanPredicateBuilder<T>[]) {
        if (predicates.length === 0) throw new Error('At least one predicate must be provided');

        return [...predicates].reverse()
            .reduce((acc, predicate, index) => {
                if (index === 0) return predicate;
                return new BooleanPredicateBuilder<T>(new Expression(operator, [acc.expression, predicate.expression]))
            });
    }
}