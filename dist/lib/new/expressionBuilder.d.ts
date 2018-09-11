import { Expression } from "./expression";
export declare class PredicateBuilder<T> {
    readonly expression?: Expression | undefined;
    /**
     *
     */
    constructor(expression?: Expression | undefined);
    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    and(predicate: PredicateBuilder<T>): PredicateBuilder<T>;
    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    or(predicate: PredicateBuilder<T>): PredicateBuilder<T>;
    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    not(predicate: PredicateBuilder<T>): PredicateBuilder<T>;
    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    fieldReference<K extends Extract<keyof T, string>>(field: K): T[K];
    /**
     * value will not be enclosed in quotes when the URL is calculated
     * @param value
     */
    guidLiteral(value: string): string;
    /**
     * Returns a value that will be the date-only portion of the value provided (e.g., 1970-01-01)
     * @param value
     */
    dateLiteral(value: string | number | Date): Date;
    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    equals<K extends keyof T>(field: K, value: T[K]): PredicateBuilder<T>;
    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    notEquals<K extends keyof T>(field: K, value: T[K]): PredicateBuilder<T>;
    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    greaterThan<K extends keyof T>(field: K, value: T[K]): PredicateBuilder<T>;
    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    lessThan<K extends keyof T>(field: K, value: T[K]): PredicateBuilder<T>;
    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    greaterThanOrEqualTo<K extends keyof T>(field: K, value: T[K]): PredicateBuilder<T>;
    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    lessThanOrEqualTo<K extends keyof T>(field: K, value: T[K]): PredicateBuilder<T>;
    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    contains<K extends keyof SubType<T, string>>(field: K, value: string): PredicateBuilder<T>;
    startswith<K extends keyof SubType<T, string>>(field: K, value: string): PredicateBuilder<T>;
    endswith<K extends keyof SubType<T, string>>(field: K, value: string): PredicateBuilder<T>;
}
declare type SubType<Base, Condition> = Pick<Base, {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
}[keyof Base]>;
export {};
