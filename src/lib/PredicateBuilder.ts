import { FieldReference } from "./FieldReference";
import { Expression, TypedExpression } from "./Expression";
import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { ExpressionOperator } from "./ExpressionOperator";
import { ODataQuery } from "./ODataQuery";
import { SubType } from "./SubType";

type KeyExpressionOrUnkonwn<T, K extends keyof T> = T[K] | TypedExpression<T[K]> | undefined | null;

export class PredicateBuilder<T> {

    constructor(public readonly expression?: Expression) { }

    /**
     * Negates the result of the predicate provided.
     * @param predicate Use the same FilterBuilder that this method chain was invoked with.
     */
    public not(predicate: BooleanPredicateBuilder<T>) {
        if (!predicate.expression)
            throw new Error(`'and' predicate must have at least one non-empty Predicate`);

        return new BooleanPredicateBuilder<T>(new Expression(ExpressionOperator.Not, [this.expression], predicate.expression));
    }

    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record.
     * @param field
     */
    public fieldReference<K extends Extract<keyof T, string>>(field: K) {
        return new TypedExpression<T[K]>(ExpressionOperator.FieldReference, [new FieldReference<T>(field)]);
    }

    /**
     * Filters based on equality of a field with the provided value.
     * @param field
     * @param value
     */
    public equals<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T, K>) {
        const expression = new Expression(ExpressionOperator.Equals, [new FieldReference<T>(field), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field not having the provided value.
     * @param field
     * @param value
     */
    public notEquals<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T, K>) {
        const expression = new Expression(ExpressionOperator.NotEquals, [new FieldReference<T>(field), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being greater than (>) the provided value.
     * @param field
     * @param value
     */
    public greaterThan<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T, K>) {
        const expression = new Expression(ExpressionOperator.GreaterThan, [new FieldReference<T>(field), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being less than (<) the provided value.
     * @param field
     * @param value
     */
    public lessThan<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T, K>) {
        const expression = new Expression(ExpressionOperator.LessThan, [new FieldReference<T>(field), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being greater than or equal to (>=) the provided value.
     * @param field
     * @param value
     */
    public greaterThanOrEqualTo<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T, K>) {
        const expression = new Expression(ExpressionOperator.GreaterThanOrEqualTo, [new FieldReference<T>(field), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being greater than or equal to (<=) the provided value.
     * @param field
     * @param value
     */
    public lessThanOrEqualTo<K extends Extract<keyof T, string>>(field: K, value: KeyExpressionOrUnkonwn<T, K>) {
        const expression = new Expression(ExpressionOperator.LessThanOrEqualTo, [new FieldReference<T>(field), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field containing the provided value.
     * @param field
     * @param value
     */
    public contains<K extends keyof SubType<T, string>>(field: K, value: string | TypedExpression<string>) {
        const expression = new Expression(ExpressionOperator.Contains, [new FieldReference<T>(field as any), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on field starting with the provided value.
     * @param field 
     * @param value 
     */
    public startsWith<K extends keyof SubType<T, string>>(field: K, value: string | TypedExpression<string>) {
        const expression = new Expression(ExpressionOperator.StartsWith, [new FieldReference<T>(field as any), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field ending with the provided value.
     * @param field 
     * @param value 
     */
    public endsWith<K extends keyof SubType<T, string>>(field: K, value: string | TypedExpression<string>) {
        const expression = new Expression(ExpressionOperator.EndsWith, [new FieldReference<T>(field as any), value], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being any one of the provided values.
     * @param field 
     * @param values 
     */
    public any<K extends Extract<keyof T, string>>(field: K, values: ArrayLike<KeyExpressionOrUnkonwn<T, K>> | Iterable<KeyExpressionOrUnkonwn<T, K>>){
        const expression = new Expression(ExpressionOperator.In, [new FieldReference<T>(field), Array.from(values)], this.expression);
        return new BooleanPredicateBuilder<T>(expression);
    }
}