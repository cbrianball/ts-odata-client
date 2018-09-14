"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ODataQuery_1 = require("./ODataQuery");
var ODataQueryProvider = /** @class */ (function () {
    function ODataQueryProvider() {
    }
    ODataQueryProvider.prototype.createQuery = function (expression) {
        return new ODataQuery_1.ODataQuery(this, expression);
    };
    return ODataQueryProvider;
}());
exports.ODataQueryProvider = ODataQueryProvider;
