"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TypedExpressionVisitor_1 = require("./TypedExpressionVisitor");
var FieldReference_1 = require("./FieldReference");
var Expression_1 = require("./Expression");
var literal_1 = require("./literal");
var ODataV4ExpressionVisitor = /** @class */ (function (_super) {
    __extends(ODataV4ExpressionVisitor, _super);
    function ODataV4ExpressionVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.oDataQuery = {
            filter: "",
        };
        return _this;
    }
    ODataV4ExpressionVisitor.prototype.selectVisitor = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        this.oDataQuery.select = fields.map(function (f) { return f.toString(); });
    };
    ODataV4ExpressionVisitor.prototype.orderByVisitor = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        var _a;
        if (!this.oDataQuery.orderBy)
            this.oDataQuery.orderBy = [];
        (_a = this.oDataQuery.orderBy).push.apply(_a, fields.map(function (f) { return ({ field: f.toString() }); }));
    };
    ODataV4ExpressionVisitor.prototype.orderByDescendingVisitor = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        var _a;
        if (!this.oDataQuery.orderBy)
            this.oDataQuery.orderBy = [];
        (_a = this.oDataQuery.orderBy).push.apply(_a, fields.map(function (f) { return ({ field: f.toString(), sort: 'desc' }); }));
    };
    ODataV4ExpressionVisitor.prototype.skipVisitor = function (value) {
        this.oDataQuery.skip = value;
    };
    ODataV4ExpressionVisitor.prototype.topVisitor = function (value) {
        this.oDataQuery.top = value;
    };
    ODataV4ExpressionVisitor.prototype.predicateVisitor = function (predicate) {
        if (!predicate.expression)
            return;
        if (predicate.expression.previous)
            throw new Error("Filter Expressions cannot have a value for 'previous', only operands");
        var filter = this.translatePredicateExpression(predicate.expression);
        if (this.oDataQuery.filter && filter.length > 1) {
            filter = ['('].concat(filter, [')']);
        }
        this.oDataQuery.filter += filter.join('');
    };
    ODataV4ExpressionVisitor.prototype.translatePredicateExpression = function (expression) {
        var translation = [];
        for (var _i = 0, _a = expression.operands; _i < _a.length; _i++) {
            var operand = _a[_i];
            if (operand instanceof literal_1.Literal) {
                translation.push([this.deriveLiteral(operand)]);
            }
            else if (operand instanceof FieldReference_1.FieldReference) {
                translation.push([operand.toString()]);
            }
            else if (operand instanceof Expression_1.Expression) {
                translation.push(this.translatePredicateExpression(operand));
            }
            else //assume this is a literal without the type specified
                translation.push([this.deriveLiteral(new literal_1.Literal(operand))]);
        }
        if (translation.length === 1) {
            switch (expression.operator) {
                case "not" /* Not */:
                    return ['not ' + this.reduceTranslatedExpression(translation[0])];
                default:
                    throw new Error("Operator '" + expression.operator + "' is not supported");
            }
        }
        else if (translation.length === 2) {
            var left = translation[0], right = translation[1];
            switch (expression.operator) {
                case "and" /* And */:
                    return [this.reduceTranslatedExpression(left) + " and " + this.reduceTranslatedExpression(right)];
                case "equals" /* Equals */:
                    return [this.reduceTranslatedExpression(left) + " eq " + this.reduceTranslatedExpression(right)];
                case "greaterThan" /* GreaterThan */:
                    return [this.reduceTranslatedExpression(left) + " gt " + this.reduceTranslatedExpression(right)];
                case "greaterThanOrEqualTo" /* GreaterThanOrEqualTo */:
                    return [this.reduceTranslatedExpression(left) + " ge " + this.reduceTranslatedExpression(right)];
                case "lessThan" /* LessThan */:
                    return [this.reduceTranslatedExpression(left) + " lt " + this.reduceTranslatedExpression(right)];
                case "lessThanOrEqualTo" /* LessThanOrEqualTo */:
                    return [this.reduceTranslatedExpression(left) + " le " + this.reduceTranslatedExpression(right)];
                case "notEquals" /* NotEquals */:
                    return [this.reduceTranslatedExpression(left) + " ne " + this.reduceTranslatedExpression(right)];
                case "or" /* Or */:
                    return [this.reduceTranslatedExpression(left) + " or " + this.reduceTranslatedExpression(right)];
                default:
                    throw new Error("Operator '" + expression.operator + "' is not supported");
            }
        }
        throw new Error("Operator '" + expression.operator + "' is not supported");
    };
    ODataV4ExpressionVisitor.prototype.reduceTranslatedExpression = function (value) {
        if (value.length === 0)
            return [];
        if (value.length === 1)
            return "" + value[0];
        return "(" + value.join(' ') + ")";
    };
    ODataV4ExpressionVisitor.prototype.deriveLiteral = function (literal) {
        var value = literal.value;
        switch (literal.literalType) {
            case "date" /* Date */:
                return new Date(value).toISOString().substring(0, 10);
            case "guid" /* Guid */:
                return value.toString();
        }
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
        return value.toString();
    };
    return ODataV4ExpressionVisitor;
}(TypedExpressionVisitor_1.TypedExpressionVisitor));
exports.ODataV4ExpressionVisitor = ODataV4ExpressionVisitor;
