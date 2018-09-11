"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var literal_1 = require("./literal");
var fieldReference_1 = require("./fieldReference");
var expression_1 = require("./expression");
var PredicateBuilder = /** @class */ (function () {
    /**
     *
     */
    function PredicateBuilder(expression) {
        this.expression = expression;
    }
    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    PredicateBuilder.prototype.and = function (predicate) {
        if (!this.expression)
            throw new Error("'and' predicate must come after a non-empty Predicate");
        if (!predicate.expression)
            throw new Error("'and' predicate must have at least one non-empty Predicate");
        return new PredicateBuilder(new expression_1.Expression('and', [this.expression], predicate.expression));
    };
    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    PredicateBuilder.prototype.or = function (predicate) {
        if (!this.expression)
            throw new Error("'or' predicate must come after a non-empty Predicate");
        if (!predicate.expression)
            throw new Error("'or' predicate must have at least one non-empty Predicate");
        return new PredicateBuilder(new expression_1.Expression('or', [this.expression], predicate.expression));
    };
    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    PredicateBuilder.prototype.not = function (predicate) {
        if (!predicate.expression)
            throw new Error("'and' predicate must have at least one non-empty Predicate");
        return new PredicateBuilder(new expression_1.Expression('not', [this.expression], predicate.expression));
    };
    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    PredicateBuilder.prototype.fieldReference = function (field) {
        //'tricking' TypeScript into believing the return type is correct
        return new fieldReference_1.FieldReference(field);
    };
    /**
     * value will not be enclosed in quotes when the URL is calculated
     * @param value
     */
    PredicateBuilder.prototype.guidLiteral = function (value) {
        //'tricking' TypeScript into believing the return type is correct
        return new literal_1.Literal('guid', value);
    };
    /**
     * Returns a value that will be the date-only portion of the value provided (e.g., 1970-01-01)
     * @param value
     */
    PredicateBuilder.prototype.dateLiteral = function (value) {
        return new literal_1.Literal('date', value);
    };
    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.equals = function (field, value) {
        var expression = new expression_1.Expression('equals', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.notEquals = function (field, value) {
        var expression = new expression_1.Expression('notEquals', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.greaterThan = function (field, value) {
        var expression = new expression_1.Expression('greaterThan', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.lessThan = function (field, value) {
        var expression = new expression_1.Expression('lessThan', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.greaterThanOrEqualTo = function (field, value) {
        var expression = new expression_1.Expression('greaterThanOrEqualTo', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.lessThanOrEqualTo = function (field, value) {
        var expression = new expression_1.Expression('lessThanOrEqualTo', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.contains = function (field, value) {
        var expression = new expression_1.Expression('contains', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    PredicateBuilder.prototype.startswith = function (field, value) {
        var expression = new expression_1.Expression('startsWith', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    PredicateBuilder.prototype.endswith = function (field, value) {
        var expression = new expression_1.Expression('endsWith', [field, value], this.expression);
        return new PredicateBuilder(expression);
    };
    return PredicateBuilder;
}());
exports.PredicateBuilder = PredicateBuilder;
