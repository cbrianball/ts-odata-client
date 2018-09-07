"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var filterBuilder_1 = require("../lib/filterBuilder");
var odataProvider_1 = require("../lib/odataProvider");
var odataEndpoint_1 = require("../lib/odataEndpoint");
describe("combining conjunction clauses", function () {
    var provider = new odataProvider_1.ODataProvider({ baseUrl: '/' });
    var endpoint = new odataEndpoint_1.ODataEndpoint(provider);
    var builder = filterBuilder_1.FilterBuilder.for(endpoint);
    it("when all clauses are ANDs", function () {
        var filter = builder.equals('firstName', 'David').and(builder.equals('firstName', 'Joe').and(builder.greaterThan('age', 10)));
        chai_1.expect(filter.toString()).to.equal("firstName eq 'David' and 'firstName eq 'Joe' and age gt 10");
    });
});
