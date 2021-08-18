import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { Expression } from "./Expression";
import { ExpressionOperator } from "./ExpressionOperator";

/**
 * Provides additional functionality for the .filter() method on @type {ODataQuery}
 */
export class FilterAccessoryFunctions<T> {
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
        if (predicates.length === 0)
            throw new Error('At least one predicate must be provided');

        return predicates
            .reduce((acc, predicate, index) => {
                if (index === 0)
                    return predicate;
                return new BooleanPredicateBuilder<T>(new Expression(operator, [acc.expression, predicate.expression]));
            });
    }
}