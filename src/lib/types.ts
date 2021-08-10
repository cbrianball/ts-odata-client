import type { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import type { FilterAccessoryFunctions } from "./FilterAccessoryFunctions";

export const resolveQuery = Symbol();
export const createProxiedEntity = Symbol();
export const propertyPath = Symbol();
export const lambdaVariable = Symbol();

type QueryableFieldsFor<T> =
    T extends number ? Exclude<keyof T, keyof number> :
    T extends string ? Exclude<keyof T, keyof string> :
    T extends Date ? Exclude<keyof T, keyof Date> :
    T extends Array<any> ? Exclude<keyof T, keyof Array<any>> :
    T extends Object ? Exclude<keyof T, keyof Object> :
    keyof T & string;

export type EntityProxy<T> = {
    [P in QueryableFieldsFor<T>]: PropertyProxy<T[P]>;
} & {
    [lambdaVariable]: string;
};

type PrefixMembers<T, Prefix extends string> = {
    [P in string & keyof T as `${Prefix}${P}`]: T[P];
}


export type PropertyProxy<T> = EntityProxy<T> &
    PrefixMembers<
        T extends boolean ? BooleanProxyFieldPredicate :
        T extends number ? NumberProxyFieldPredicate :
        T extends string ? StringProxyFieldPredicate :
        T extends Date ? DateProxyFieldPredicate :
        T extends Array<any> ? ArrayProxyFieldPredicate<T> :
        // TODO: Array
        unknown, '$'>
        & {[propertyPath]: string[];};

export type PredicateArgument<T> = T | PropertyProxy<T> | null | undefined;

export interface EqualityProxyFieldPredicate<T> {
    equals(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    notEquals(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    in(value: ArrayLike<PredicateArgument<T>> | Iterable<PredicateArgument<T>>): BooleanPredicateBuilder<T>;
}

export interface InequalityProxyFieldPredicate<T> {
    lessThan(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    lessThanOrEqualTo(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    greaterThan(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
    greaterThanOrEqualTo(value: PredicateArgument<T>): BooleanPredicateBuilder<T>;
}

export interface BooleanProxyFieldPredicate extends EqualityProxyFieldPredicate<boolean> { }
export interface NumberProxyFieldPredicate extends EqualityProxyFieldPredicate<number>, InequalityProxyFieldPredicate<number> { }
export interface DateProxyFieldPredicate extends EqualityProxyFieldPredicate<Date>, InequalityProxyFieldPredicate<Date> { }

/**
 * This only exists as something for the @type {ProxyFieldPredicate} to implement.
 * If it tried to implement @type {StringProxyFieldReference} directly, then TypeScript complains.
 */
 export interface StringProxyFieldPredicateInterface {
    contains(value: PredicateArgument<string>): BooleanPredicateBuilder<string>;
    startsWith(value: PredicateArgument<string>): BooleanPredicateBuilder<string>;
    endsWith(value: PredicateArgument<string>): BooleanPredicateBuilder<string>;
}

export interface ArrayProxyFieldPredicateInterface {
    any(value: (entity: EntityProxy<any>, compound: FilterAccessoryFunctions<any>) => BooleanPredicateBuilder<any[]>): BooleanPredicateBuilder<any>;
    all(value: (entity: EntityProxy<any>, compound: FilterAccessoryFunctions<any>) => BooleanPredicateBuilder<any[]>): BooleanPredicateBuilder<any>;
}

interface ArrayProxyFieldPredicate<T extends Array<any>> {
    any(value: (entity: EntityProxy<T[number]>, compound: FilterAccessoryFunctions<T>) => BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
    all(value: (entity: EntityProxy<T[number]>, compound: FilterAccessoryFunctions<T>) => BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
}

interface StringProxyFieldPredicate extends EqualityProxyFieldPredicate<string>, InequalityProxyFieldPredicate<string>, StringProxyFieldPredicateInterface { }