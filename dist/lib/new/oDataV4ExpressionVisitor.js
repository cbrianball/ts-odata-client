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
var typedExpressionVisitor_1 = require("./typedExpressionVisitor");
var ODataV4ExpressionVisitor = /** @class */ (function (_super) {
    __extends(ODataV4ExpressionVisitor, _super);
    function ODataV4ExpressionVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.oDataQuery = {
            select: [],
            orderBy: [],
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
        (_a = this.oDataQuery.orderBy).push.apply(_a, fields.map(function (f) { return ({ field: f.toString() }); }));
    };
    ODataV4ExpressionVisitor.prototype.orderByDescendingVisitor = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        var _a;
        (_a = this.oDataQuery.orderBy).push.apply(_a, fields.map(function (f) { return ({ field: f.toString(), sort: 'desc' }); }));
    };
    return ODataV4ExpressionVisitor;
}(typedExpressionVisitor_1.TypedExpressionVisitor));
exports.ODataV4ExpressionVisitor = ODataV4ExpressionVisitor;
