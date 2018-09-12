import { PredicateBuilder } from "./PredicateBuilder";
import { Expression } from "./expression";

export class BooleanPredicateBuilder<T> {

    constructor(public readonly expression?: Expression) { }

    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public and(predicate: BooleanPredicateBuilder<T>) {
        if (!this.expression)
            throw new Error(`'and' predicate must come after a non-empty Predicate`);
        if (!predicate.expression)
            throw new Error(`'and' predicate must have at least one non-empty Predicate`);

        return new BooleanPredicateBuilder<T>(new Expression('and', [this.expression, predicate.expression]));
    }

    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public or(predicate: BooleanPredicateBuilder<T>) {
        if (!this.expression)
            throw new Error(`'or' predicate must come after a non-empty Predicate`);
        if (!predicate.expression)
            throw new Error(`'or' predicate must have at least one non-empty Predicate`);

        return new BooleanPredicateBuilder<T>(new Expression('or', [this.expression, predicate.expression]));
    }
}