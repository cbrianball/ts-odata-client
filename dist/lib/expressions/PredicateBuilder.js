"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FieldReference_1 = require("./FieldReference");
var Expression_1 = require("./Expression");
var BooleanPredicateBuilder_1 = require("./BooleanPredicateBuilder");
var PredicateBuilder = /** @class */ (function () {
    function PredicateBuilder(expression) {
        this.expression = expression;
    }
    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    PredicateBuilder.prototype.not = function (predicate) {
        if (!predicate.expression)
            throw new Error("'and' predicate must have at least one non-empty Predicate");
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(new Expression_1.Expression('not', [this.expression], predicate.expression));
    };
    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    PredicateBuilder.prototype.fieldReference = function (field) {
        return new Expression_1.TypedExpression('fieldReference', [new FieldReference_1.FieldReference(field)]);
    };
    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.equals = function (field, value) {
        var expression = new Expression_1.Expression('equals', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.notEquals = function (field, value) {
        var expression = new Expression_1.Expression('notEquals', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.greaterThan = function (field, value) {
        var expression = new Expression_1.Expression('greaterThan', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.lessThan = function (field, value) {
        var expression = new Expression_1.Expression('lessThan', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.greaterThanOrEqualTo = function (field, value) {
        var expression = new Expression_1.Expression('greaterThanOrEqualTo', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.lessThanOrEqualTo = function (field, value) {
        var expression = new Expression_1.Expression('lessThanOrEqualTo', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    PredicateBuilder.prototype.contains = function (field, value) {
        var expression = new Expression_1.Expression('contains', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    PredicateBuilder.prototype.startswith = function (field, value) {
        var expression = new Expression_1.Expression('startsWith', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    PredicateBuilder.prototype.endswith = function (field, value) {
        var expression = new Expression_1.Expression('endsWith', [new FieldReference_1.FieldReference(field), value], this.expression);
        return new BooleanPredicateBuilder_1.BooleanPredicateBuilder(expression);
    };
    return PredicateBuilder;
}());
exports.PredicateBuilder = PredicateBuilder;
