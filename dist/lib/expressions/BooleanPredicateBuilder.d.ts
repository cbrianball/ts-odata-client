import { Expression } from "./Expression";
export declare class BooleanPredicateBuilder<T> {
    readonly expression?: Expression | undefined;
    constructor(expression?: Expression | undefined);
    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    and(predicate: BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    or(predicate: BooleanPredicateBuilder<T>): BooleanPredicateBuilder<T>;
}
