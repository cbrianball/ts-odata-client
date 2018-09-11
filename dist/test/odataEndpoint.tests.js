"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var odataProvider_1 = require("../lib/odataProvider");
var odataEndpoint_1 = require("../lib/odataEndpoint");
describe("combining conjunction clauses", function () {
    var provider = new odataProvider_1.ODataProvider({ baseUrl: '/' });
    var endpoint = new odataEndpoint_1.ODataEndpoint(provider);
});
