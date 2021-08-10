import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { Expression } from "./Expression";
import { ExpressionOperator } from "./ExpressionOperator";
import { FieldReference } from "./FieldReference";
import { ODataQuery } from "./ODataQuery";

interface User extends Object {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    dob: Date;
}

type QueryableFieldsFor<T> =
    T extends number ? Exclude<keyof T, keyof number> :
    T extends string ? Exclude<keyof T, keyof string> :
    T extends Date ? Exclude<keyof T, keyof Date> :
    T extends Array<any> ? Exclude<keyof T, keyof Array<any>> :
    T extends Object ? Exclude<keyof T, keyof Object> :
    keyof T & string;

type EntityProxy<T> = {
    [P in QueryableFieldsFor<T>]: PropertyProxy<T[P]>
};

type PrefixMembers<T, Prefix extends string> = {
    [P in string & keyof T as `${Prefix}${P}`]: T[P];
}

const propertyPathSymbol = Symbol();
type PropertyProxy<T> = EntityProxy<T> &
    PrefixMembers<
        T extends boolean ? BooleanProxyFieldPredicate :
        T extends number ? NumberProxyFieldPredicate :
        T extends string ? StringProxyFieldPredicate :
        T extends Date ? DateProxyFieldPredicate :
        T extends Array<any> ? ArrayProxyFieldPredicate<T> :
        // TODO: Array
        unknown, '$'> & {
            [propertyPathSymbol]: string[];
        }

class ProxyFieldPredicate<T> implements
    EqualityProxyFieldPredicate<T>,
    InequalityProxyFieldPredicate<T>,
    StringProxyFieldPredicateInterface,
    ArrayProxyFieldPredicateInterface {
    private readonly fieldReference: FieldReference<T>;
    constructor(propertyProxy: PropertyProxy<T>) {
        this.fieldReference = this.getFieldReference(propertyProxy);
    }

    equals(value: PredicateArgument<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Equals);
    }

    notEquals(value: PredicateArgument<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.NotEquals);
    }

    in(value: ArrayLike<PredicateArgument<T>> | Iterable<PredicateArgument<T>>) {
        return this.buildPredicateBuilder(Array.from(value), ExpressionOperator.In);
    }

    lessThan(value: PredicateArgument<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThan);
    }

    lessThanOrEqualTo(value: PredicateArgument<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.LessThanOrEqualTo);
    }

    greaterThan(value: PredicateArgument<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThan);
    }

    greaterThanOrEqualTo(value: PredicateArgument<T>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.GreaterThanOrEqualTo);
    }

    contains(value: PredicateArgument<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.Contains);
    }

    startsWith(value: PredicateArgument<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.StartsWith);
    }

    endsWith(value: PredicateArgument<string>) {
        return this.buildPredicateBuilder(value, ExpressionOperator.EndsWith);
    }

    any<U>(value: BooleanPredicateBuilder<U[]> | ((entity: EntityProxy<U>, compound: ProxyBooleanFunctions<U>) => BooleanPredicateBuilder<U[]>)) {
        if(typeof value === "function") {
            value = value(getEntityProxy<U>(), new ProxyBooleanFunctions<U>());
        }
        return this.buildPredicateBuilder(value.expression, ExpressionOperator.Any);
    }

    all<U>(value: BooleanPredicateBuilder<U[]> | ((entity: EntityProxy<U>, compound: ProxyBooleanFunctions<U>) => BooleanPredicateBuilder<U[]>)) {
        if(typeof value === "function") {
            value = value(getEntityProxy<U>(), new ProxyBooleanFunctions<U>());
        }
        return this.buildPredicateBuilder(value.expression, ExpressionOperator.All);
    }

    protected buildPredicateBuilder<P>(value: P | PropertyProxy<P>, operator: ExpressionOperator) {
        let operand: any = value;
        const propertyPath = value == null ? null : (value as any)[propertyPathSymbol] as string[] | undefined;
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

type PredicateArgument<T> = T | PropertyProxy<T> | null | undefined;

interface EqualityProxyFieldPredicate<T> {
    equals(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    notEquals(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    in(value: ArrayLike<PredicateArgument<T>> | Iterable<PredicateArgument<T>>): BooleanPredicateBuilder<T>;
}

interface InequalityProxyFieldPredicate<T> {
    lessThan(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    lessThanOrEqualTo(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    greaterThan(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    greaterThanOrEqualTo(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
}

interface BooleanProxyFieldPredicate extends EqualityProxyFieldPredicate<boolean> { };
interface NumberProxyFieldPredicate extends EqualityProxyFieldPredicate<number>, InequalityProxyFieldPredicate<number> { };
interface DateProxyFieldPredicate extends EqualityProxyFieldPredicate<Date>, InequalityProxyFieldPredicate<Date> { };

/**
 * This only exists as something for the @type {ProxyFieldPredicate} to implement.
 * If it tried to implement @type {StringProxyFieldReference} directly, then TypeScript complains.
 */
interface StringProxyFieldPredicateInterface {
    contains(value: PredicateArgument<string>): BooleanPredicateBuilder<string>;
    startsWith(value: PredicateArgument<string>): BooleanPredicateBuilder<string>;
    endsWith(value: PredicateArgument<string>): BooleanPredicateBuilder<string>;
}

interface ArrayProxyFieldPredicateInterface {
    any(value: BooleanPredicateBuilder<any[]> | ((entity: EntityProxy<any>, compound: ProxyBooleanFunctions<any>) => BooleanPredicateBuilder<any[]>)): BooleanPredicateBuilder<any>;
    all(value: BooleanPredicateBuilder<any[]> | ((entity: EntityProxy<any>, compound: ProxyBooleanFunctions<any>) => BooleanPredicateBuilder<any[]>)): BooleanPredicateBuilder<any>;
}

interface ArrayProxyFieldPredicate<T extends Array<any>> {
    any(value: BooleanPredicateBuilder<T> | ((entity: EntityProxy<T[number]>, compound: ProxyBooleanFunctions<T>) => BooleanPredicateBuilder<T>)): BooleanPredicateBuilder<T>;
    all(value: BooleanPredicateBuilder<T> | ((entity: EntityProxy<T[number]>, compound: ProxyBooleanFunctions<T>) => BooleanPredicateBuilder<T>)): BooleanPredicateBuilder<T>;
}

interface StringProxyFieldPredicate extends EqualityProxyFieldPredicate<string>, InequalityProxyFieldPredicate<string>, StringProxyFieldPredicateInterface { }



export function usingProxy<T>(entity: ((entity: EntityProxy<T>, compound: ProxyBooleanFunctions<T>) => BooleanPredicateBuilder<T>)): BooleanPredicateBuilder<T> {
    const proxy = getEntityProxy<T>();
    const proxyFunctions = new ProxyBooleanFunctions<T>();
    return entity(proxy, proxyFunctions);
}

// const foo = {} as unknown as ODataQuery<User>;

// //options for filter:
// foo.filter(u => u.equals('id', 10).and(u.lessThan('lastName', u.fieldReference('firstName'))));
// foo.filter(usingProxy(u => u.id.equals(10).and(u.lastName.lessThan(u.firstName))));
// foo.filter(usingProxy((u, {not}) => not(u.id.$is.greaterThanOrEqualTo(12))));

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
            if (property.startsWith("$")) {
                const predicate = new ProxyFieldPredicate<T>(target as PropertyProxy<T>);
                return ((predicate as unknown as any)[property.slice(1)] as Function).bind(predicate);
            }
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
        return new BooleanPredicateBuilder<T>(new Expression(ExpressionOperator.Not, [predicate.expression]));
    }

    private combinePredicates(operator: ExpressionOperator, ...predicates: BooleanPredicateBuilder<T>[]) {
        if (predicates.length === 0) throw new Error('At least one predicate must be provided');

        return predicates
            .reduce((acc, predicate, index) => {
                if (index === 0) return predicate;
                return new BooleanPredicateBuilder<T>(new Expression(operator, [acc.expression, predicate.expression]))
            });
    }
}

interface Person {
    $firstName: string;
    $lastName: string;
    $age: number;
    $email: string;
    $children: string[];
    $pets: string[];
}