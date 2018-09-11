"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var oDataQuery_1 = require("./oDataQuery");
var ODataQueryProvider = /** @class */ (function () {
    function ODataQueryProvider() {
    }
    ODataQueryProvider.prototype.createQuery = function (expression) {
        return new oDataQuery_1.ODataQuery(this, expression);
    };
    ODataQueryProvider.prototype.generateQuery = function (expression) {
        var query = this.buildQuery(expression, {});
        return this.buildODataString(query);
    };
    ODataQueryProvider.prototype.transformExpression = function (expression, query) {
        switch (expression.operator) {
            case "select":
                query.select = expression.operands.map(function (v) { return v.toString(); });
                break;
            case "top":
                query.top = expression.operands[0];
                break;
            case "skip":
                query.skip = expression.operands[0];
                break;
            case "count":
                query.count = "true";
                break;
            case "orderBy":
                query.orderBy = (query.orderBy || []).concat(expression.operands.map(function (v) { return ({ field: v }); }));
                break;
            case "orderByDescending":
                query.orderBy = (query.orderBy || []).concat(expression.operands.map(function (v) { return ({ field: v, direction: "desc" }); }));
                break;
            case "key":
                query.key = expression.operands[0].toString();
                break;
            case "filter":
                //TODO: filter
                break;
            default: throw new Error("Oporator '" + expression.operator + " is not supported");
        }
        return query;
    };
    ODataQueryProvider.prototype.buildODataString = function (query) {
        var returnValue = "";
        if ('key' in query) {
            returnValue += "(" + this.deriveValue(query.key) + ")";
            delete query.key;
        }
        var fragments = [];
        for (var field in query) {
            fragments.push("$" + field + "=" + this.deriveValue(query[field]));
        }
        if (fragments.length === 0)
            return returnValue;
        return returnValue + ("?" + fragments.join("&"));
    };
    ODataQueryProvider.prototype.buildQuery = function (expression, query) {
        if (!query)
            query = {};
        while (expression.previous) {
            query = this.buildQuery(expression.previous, query);
        }
        return this.transformExpression(expression, query);
    };
    return ODataQueryProvider;
}());
exports.ODataQueryProvider = ODataQueryProvider;
