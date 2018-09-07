"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var odataProvider_1 = require("../lib/odataProvider");
var odataEndpoint_1 = require("../lib/odataEndpoint");
describe("combining conjunction clauses", function () {
    var provider = new odataProvider_1.ODataProvider({ baseUrl: '/' });
    var endpoint = new odataEndpoint_1.ODataEndpoint(provider);
});
var Bar = /** @class */ (function () {
    function Bar() {
    }
    return Bar;
}());
var Foo = /** @class */ (function () {
    function Foo(c) {
        new c();
    }
    return Foo;
}());
var a = new Foo(Bar);
