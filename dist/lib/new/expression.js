"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Expression = /** @class */ (function () {
    function Expression(operator, operands, previous) {
        this.operator = operator;
        this.operands = operands;
        this.previous = previous;
    }
    return Expression;
}());
exports.Expression = Expression;
