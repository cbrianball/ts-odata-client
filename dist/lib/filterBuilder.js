"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilterBuilder = /** @class */ (function () {
    function FilterBuilder(filterClauses) {
        this.filterClauses = filterClauses;
    }
    FilterBuilder.for = function (query) { return new FilterBuilder([]); };
    FilterBuilder.prototype.transformValue = function (value) {
        switch (typeof value) {
            case "string":
                return "'" + value + "'";
            case "number":
            case "boolean":
                return value.toString();
            case "undefined":
                return 'null';
            case "function":
                throw new Error("function not supported");
            case "symbol":
                throw new Error("symbol not supported");
            case "object":
                //objects handled below
                break;
            default:
                throw new Error("Unhandled primitive type: " + value);
        }
        if (value === null)
            return "null";
        if (value instanceof Date)
            return value.toISOString();
        if (value instanceof String)
            return value.toString();
        throw new Error("object type with constructor '" + value.constructor.name + "' not supported");
    };
    FilterBuilder.prototype.conjunctionBuilder = function (conjunction, predicate) {
        if (this.filterClauses.length === 0)
            throw new Error("Cannot use '" + conjunction + "()' as the first call to FilterBuilder");
        if (!predicate || !predicate.filterClauses || predicate.filterClauses.length <= 0)
            throw new Error("Result of '" + conjunction + "()' must have at least one filter");
        var clauses = predicate.filterClauses;
        if (clauses.length > 1)
            clauses = [" " + conjunction + "("].concat(clauses, [')']);
        else
            clauses = [" " + conjunction + " "].concat(clauses);
        return new FilterBuilder(this.filterClauses.concat(clauses));
    };
    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    FilterBuilder.prototype.and = function (predicate) {
        return this.conjunctionBuilder('and', predicate);
    };
    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    FilterBuilder.prototype.or = function (predicate) {
        return this.conjunctionBuilder('or', predicate);
    };
    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    FilterBuilder.prototype.not = function (predicate) {
        if (!predicate || !predicate.filterClauses || predicate.filterClauses.length <= 0)
            throw new Error("Result of 'not' must have at least one filter");
        var clauses = predicate.filterClauses;
        if (clauses.length > 1)
            clauses = ["not("].concat(clauses, [')']);
        else
            clauses = ["not "].concat(clauses);
        return new FilterBuilder(this.filterClauses.concat(clauses));
    };
    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    FilterBuilder.prototype.fieldReference = function (field) {
        //returning String object instead of primitive so it will not be enclosed in quotes when the URL is calculated
        //'tricking' TypeScript into believing the return type is correct
        //at runtime, this will always return a String, but should only be consumed by other methods in this class
        return new String(field);
    };
    /**
     * value will not be enclosed in quotes when the URL is calculated
     * @param value
     */
    FilterBuilder.prototype.guidLiteral = function (value) {
        return new String(value);
    };
    /**
     * Returns a value that will be the date-only portion of the value provided (e.g., 1970-01-01)
     * @param value
     */
    FilterBuilder.prototype.dateLiteral = function (value) {
        if (value instanceof Date)
            return value;
        return new String(new Date(value).toISOString().substring(0, 10));
    };
    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    FilterBuilder.prototype.equals = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat([field + " eq " + this.transformValue(value)]));
    };
    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    FilterBuilder.prototype.notEquals = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat([field + " ne " + this.transformValue(value)]));
    };
    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    FilterBuilder.prototype.greaterThan = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat([field + " gt " + this.transformValue(value)]));
    };
    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    FilterBuilder.prototype.lessThan = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat([field + " lt " + this.transformValue(value)]));
    };
    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    FilterBuilder.prototype.greaterThanOrEqualTo = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat([field + " ge " + this.transformValue(value)]));
    };
    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    FilterBuilder.prototype.lessThanOrEqualTo = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat([field + " le " + this.transformValue(value)]));
    };
    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    FilterBuilder.prototype.contains = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat(["contains(" + field + "," + this.transformValue(value) + ")"]));
    };
    FilterBuilder.prototype.startswith = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat(["startswith(" + field + "," + this.transformValue(value) + ")"]));
    };
    FilterBuilder.prototype.endswith = function (field, value) {
        return new FilterBuilder(this.filterClauses.concat(["endswith(" + field + "," + this.transformValue(value) + ")"]));
    };
    FilterBuilder.prototype.toString = function () {
        return this.filterClauses.join('');
    };
    return FilterBuilder;
}());
exports.FilterBuilder = FilterBuilder;
