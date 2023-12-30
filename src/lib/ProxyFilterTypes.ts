import type { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import type { FilterAccessoryFunctions } from "./FilterAccessoryFunctions";
import type { EntityProxy, PropertyProxy } from "./ProxyTypes";

export const resolveQuery = Symbol();
export const createProxiedEntity = Symbol();

type PrefixMembers<T, Prefix extends string> = {
  [P in string & keyof T as `${Prefix}${P}`]: T[P];
};

export type ProxyFilterMethods<T> = PrefixMembers<
  T extends boolean
    ? BooleanProxyFieldPredicate
    : T extends number
      ? NumberProxyFieldPredicate
      : T extends string
        ? StringProxyFieldPredicate
        : T extends Date
          ? DateProxyFieldPredicate
          : T extends Array<unknown>
            ? ArrayProxyFieldPredicate<T>
            : // TODO: Array
              unknown,
  "$"
>;

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

export interface BooleanProxyFieldPredicate extends EqualityProxyFieldPredicate<boolean> {}
export interface NumberProxyFieldPredicate
  extends EqualityProxyFieldPredicate<number>,
    InequalityProxyFieldPredicate<number> {}
export interface DateProxyFieldPredicate
  extends EqualityProxyFieldPredicate<Date>,
    InequalityProxyFieldPredicate<Date> {}

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
  any(
    value: (
      entity: EntityProxy<unknown, true>,
      compound: FilterAccessoryFunctions<unknown>,
    ) => BooleanPredicateBuilder<unknown[]>,
  ): BooleanPredicateBuilder<unknown>;
  all(
    value: (
      entity: EntityProxy<unknown, true>,
      compound: FilterAccessoryFunctions<unknown>,
    ) => BooleanPredicateBuilder<unknown[]>,
  ): BooleanPredicateBuilder<unknown>;
}

interface ArrayProxyFieldPredicate<T extends Array<unknown>> {
  any(
    value: (entity: EntityProxy<T[number], true>, compound: FilterAccessoryFunctions<T>) => BooleanPredicateBuilder<T>,
  ): BooleanPredicateBuilder<T>;
  all(
    value: (entity: EntityProxy<T[number], true>, compound: FilterAccessoryFunctions<T>) => BooleanPredicateBuilder<T>,
  ): BooleanPredicateBuilder<T>;
}

interface StringProxyFieldPredicate
  extends EqualityProxyFieldPredicate<string>,
    InequalityProxyFieldPredicate<string>,
    StringProxyFieldPredicateInterface {}

/**
 * Returned type from OData call. JSON does not natively support dates.
 * Interfaces/Types created by consuming libraries should use @type {Date} in their definition;
 * but when data is actually received from OData service, the type, at runtime, will be a string.
 */
export type ReplaceDateWithString<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends boolean | string | number | Array<unknown>
      ? T[P]
      : ReplaceDateWithString<T[P]>;
};

/**
 * Useful to correctly type a class property that will be assigned a method's return value
 * e.g.,
 * class {
 *  users: AwaitedReturnType<typeof getUsers>;
 *  async getUsers() { ... }
 * }
 * If getUsers's return type is inferred, then any updates to the OData Query will automatically be reflected in the users field type.
 */
export type AwaitedReturnType<T extends (...args: unknown[]) => unknown> = T extends (...args: unknown[]) => infer R
  ? R extends Promise<infer P>
    ? P
    : R
  : unknown;

export type ProjectorType = {
  [K: string]: boolean | number | string | Date | Array<unknown> | ProjectorType;
};
