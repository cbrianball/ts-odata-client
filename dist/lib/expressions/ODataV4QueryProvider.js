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
var ODataQueryProvider_1 = require("./ODataQueryProvider");
var Literal_1 = require("./Literal");
var FieldReference_1 = require("./FieldReference");
var ODataV4QueryProvider = /** @class */ (function (_super) {
    __extends(ODataV4QueryProvider, _super);
    function ODataV4QueryProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ODataV4QueryProvider.prototype.executeQueryAsync = function (expression) {
        throw new Error("Method not implemented.");
    };
    ODataV4QueryProvider.prototype.deriveValue = function (queryValue) {
        if (queryValue instanceof Literal_1.Literal) {
            switch (queryValue.literalType) {
                case "guid":
                    return queryValue.value;
                case "date":
                    var dateValue = queryValue.value;
                    if (dateValue instanceof Date === false)
                        dateValue = new Date(queryValue.value);
                    return dateValue.toISOString().substring(0, 10);
                default: throw new Error("Literal '" + queryValue.literalType + "' not supported by QueryProvider");
            }
        }
        if (queryValue instanceof FieldReference_1.FieldReference) {
            return queryValue.toString();
        }
        switch (typeof queryValue) {
            case "string":
                return "'" + queryValue + "'";
            case "number":
            case "boolean":
                return queryValue.toString();
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
                throw new Error("Unhandled primitive type: " + queryValue);
        }
        if (queryValue === null)
            return "null";
        if (queryValue instanceof Date)
            return queryValue.toISOString();
        if (queryValue instanceof String)
            return queryValue.toString();
        return queryValue.toString();
    };
    return ODataV4QueryProvider;
}(ODataQueryProvider_1.ODataQueryProvider));
exports.ODataV4QueryProvider = ODataV4QueryProvider;
