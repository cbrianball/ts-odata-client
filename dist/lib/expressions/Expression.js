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
var Literal_1 = require("./Literal");
var Expression = /** @class */ (function () {
    function Expression(operator, operands, previous) {
        this.operator = operator;
        this.operands = operands;
        this.previous = previous;
    }
    Expression.literal = function (value, literalType) {
        if (literalType === void 0) { literalType = typeof value; }
        return new TypedExpression('literal', [new Literal_1.Literal(value, literalType)]);
    };
    return Expression;
}());
exports.Expression = Expression;
var TypedExpression = /** @class */ (function (_super) {
    __extends(TypedExpression, _super);
    function TypedExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TypedExpression;
}(Expression));
exports.TypedExpression = TypedExpression;
