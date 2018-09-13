"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Evaluates Expression by calling methods on type that follow the pattern of '[operator]Visitor'.
 * The operands are passed in as parameters.
 */
var TypedExpressionVisitor = /** @class */ (function () {
    function TypedExpressionVisitor() {
    }
    TypedExpressionVisitor.prototype.visit = function (expression) {
        if (!expression)
            throw new Error("'expression' is a required parameter.");
        if (expression.previous)
            this.visit(expression.previous);
        var member = this[expression.operator + "Visitor"];
        if (typeof member !== "function")
            throw new Error("No method found named '" + expression.operator + "Visitor'; operator is not supported.");
        member.apply(this, expression.operands);
    };
    return TypedExpressionVisitor;
}());
exports.TypedExpressionVisitor = TypedExpressionVisitor;
