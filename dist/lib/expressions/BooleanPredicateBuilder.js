"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Expression_1 = require("./Expression");
var BooleanPredicateBuilder = /** @class */ (function () {
    function BooleanPredicateBuilder(expression) {
        this.expression = expression;
    }
    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    BooleanPredicateBuilder.prototype.and = function (predicate) {
        if (!this.expression)
            throw new Error("'and' predicate must come after a non-empty Predicate");
        if (!predicate.expression)
            throw new Error("'and' predicate must have at least one non-empty Predicate");
        return new BooleanPredicateBuilder(new Expression_1.Expression('and', [this.expression, predicate.expression]));
    };
    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    BooleanPredicateBuilder.prototype.or = function (predicate) {
        if (!this.expression)
            throw new Error("'or' predicate must come after a non-empty Predicate");
        if (!predicate.expression)
            throw new Error("'or' predicate must have at least one non-empty Predicate");
        return new BooleanPredicateBuilder(new Expression_1.Expression('or', [this.expression, predicate.expression]));
    };
    return BooleanPredicateBuilder;
}());
exports.BooleanPredicateBuilder = BooleanPredicateBuilder;
