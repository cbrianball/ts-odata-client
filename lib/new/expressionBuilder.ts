import { Literal } from "./literal";
import { FieldReference } from "./fieldReference";
import { Expression } from "./expression";

export class PredicateBuilder<T> {

    /**
     *
     */
    constructor(public readonly expression?: Expression) { }

    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public and(predicate: PredicateBuilder<T>) {
        if (!this.expression)
            throw new Error(`'and' predicate must come after a non-empty Predicate`);
        if (!predicate.expression)
            throw new Error(`'and' predicate must have at least one non-empty Predicate`);

        return new PredicateBuilder<T>(new Expression('and', [this.expression], predicate.expression));
    }

    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public or(predicate: PredicateBuilder<T>) {
        if (!this.expression)
            throw new Error(`'or' predicate must come after a non-empty Predicate`);
        if (!predicate.expression)
            throw new Error(`'or' predicate must have at least one non-empty Predicate`);

        return new PredicateBuilder<T>(new Expression('or', [this.expression], predicate.expression));
    }

    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public not(predicate: PredicateBuilder<T>) {        
        if (!predicate.expression)
            throw new Error(`'and' predicate must have at least one non-empty Predicate`);

        return new PredicateBuilder<T>(new Expression('not', [this.expression], predicate.expression));        
    }

    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    public fieldReference<K extends Extract<keyof T, string>>(field: K): T[K] {
        //'tricking' TypeScript into believing the return type is correct
        return new FieldReference<T>(field) as any;
    }

    /**
     * value will not be enclosed in quotes when the URL is calculated
     * @param value
     */
    public guidLiteral(value: string): string {
        //'tricking' TypeScript into believing the return type is correct
        return new Literal('guid', value) as any;
    }

    /**
     * Returns a value that will be the date-only portion of the value provided (e.g., 1970-01-01)
     * @param value
     */
    public dateLiteral(value: string | number | Date): Date {
        return new Literal('date', value) as any;
    }

    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    public equals<K extends keyof T>(field: K, value: T[K]) {
        const expression = new Expression('equals', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    public notEquals<K extends keyof T>(field: K, value: T[K]) {
        const expression = new Expression('notEquals', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    public greaterThan<K extends keyof T>(field: K, value: T[K]) {
        const expression = new Expression('greaterThan', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    public lessThan<K extends keyof T>(field: K, value: T[K]) {
        const expression = new Expression('lessThan', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    public greaterThanOrEqualTo<K extends keyof T>(field: K, value: T[K]) {
        const expression = new Expression('greaterThanOrEqualTo', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    public lessThanOrEqualTo<K extends keyof T>(field: K, value: T[K]) {
        const expression = new Expression('lessThanOrEqualTo', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    public contains<K extends keyof SubType<T, string>>(field: K, value: string) {
        const expression = new Expression('contains', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    public startswith<K extends keyof SubType<T, string>>(field: K, value: string) {
        const expression = new Expression('startsWith', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }

    public endswith<K extends keyof SubType<T, string>>(field: K, value: string) {
        const expression = new Expression('endsWith', [field, value], this.expression);
        return new PredicateBuilder<T>(expression);
    }
}

type SubType<Base, Condition> = Pick<Base, {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}[keyof Base]>;