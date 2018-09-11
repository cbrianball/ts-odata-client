"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypedExpressionVisitor = /** @class */ (function () {
    function TypedExpressionVisitor() {
    }
    TypedExpressionVisitor.prototype.visit = function (operator, operands) {
        var member = this[operator + "Visitor"];
        if (typeof member === "function") {
            member.apply(this, operands);
        }
        else {
            throw new Error("No method found named '" + operator + "Visitor'; operator is not supported.");
        }
    };
    return TypedExpressionVisitor;
}());
exports.TypedExpressionVisitor = TypedExpressionVisitor;
