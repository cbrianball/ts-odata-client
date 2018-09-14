import { Expression, TypedExpression } from "./Expression";
import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
declare type KeyExpressionOrUnkonwn<T> = T[keyof T] | TypedExpression<T[keyof T]> | undefined | null;
export declare class PredicateBuilder<T> {
    readonly expression?: Expression | undefined;
    constructor(expression?: Expression | undefined);
    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    not(predicate: BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    fieldReference<K extends Extract<keyof T, string>>(field: K): TypedExpression<T[K]>;
    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    equals<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T>): BooleanPredicateBuilder<T>;
    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    notEquals<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T>): BooleanPredicateBuilder<T>;
    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    greaterThan<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T>): BooleanPredicateBuilder<T>;
    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    lessThan<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T>): BooleanPredicateBuilder<T>;
    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    greaterThanOrEqualTo<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T>): BooleanPredicateBuilder<T>;
    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    lessThanOrEqualTo<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T>): BooleanPredicateBuilder<T>;
    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    contains<K extends keyof SubType<T, string>>(field: K, value: string | TypedExpression<string>): BooleanPredicateBuilder<T>;
    startsWith<K extends keyof SubType<T, string>>(field: K, value: string | TypedExpression<string>): BooleanPredicateBuilder<T>;
    endsWith<K extends keyof SubType<T, string>>(field: K, value: string | TypedExpression<string>): BooleanPredicateBuilder<T>;
}
declare type SubType<Base, Condition> = Pick<Base, {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
}[keyof Base]>;
export {};
