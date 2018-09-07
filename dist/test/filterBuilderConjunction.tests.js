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
        chai_1.expect(filter.toString()).to.equal("firstName eq 'David' and firstName eq 'Joe' and age gt 10");
    });
    it("when all clauses are ORs", function () {
        var filter = builder.equals('firstName', 'David').or(builder.equals('firstName', 'Joe').or(builder.greaterThan('age', 10)));
        chai_1.expect(filter.toString()).to.equal("firstName eq 'David' or firstName eq 'Joe' or age gt 10");
    });
    it("when clauses are combination of OR and AND", function () {
        var filter = builder.equals('firstName', 'David').or(builder.equals('firstName', 'Joe').and(builder.greaterThan('age', 10)));
        chai_1.expect(filter.toString()).to.equal("firstName eq 'David' or (firstName eq 'Joe' and age gt 10)");
    });
    it("when clauses are combination of AND and OR", function () {
        var filter = builder.equals('firstName', 'David').and(builder.equals('firstName', 'Joe').or(builder.greaterThan('age', 10)));
        chai_1.expect(filter.toString()).to.equal("firstName eq 'David' and (firstName eq 'Joe' or age gt 10)");
    });
    it("when clauses are nested multiple levels", function () {
        var filter = builder.equals('firstName', 'Jack').and(builder.equals('lastName', 'Smith').or(builder.lessThanOrEqualTo('age', 20).and(builder.equals('lastName', 'Chang'))));
        chai_1.expect(filter.toString()).to.equal("firstName eq 'Jack' and (lastName eq 'Smith' or (age le 20 and lastName eq 'Chang'))");
    });
    it("when clauses are nested multiple levels(2)", function () {
        var filter = builder.equals('firstName', 'Jack')
            .and(builder.equals('lastName', 'Smith').or(builder.lessThanOrEqualTo('age', 20).or(builder.equals('lastName', 'Chang'))));
        chai_1.expect(filter.toString()).to.equal("firstName eq 'Jack' and (lastName eq 'Smith' or age le 20 or lastName eq 'Chang')");
    });
    it("when no initial clause has been set, should throw error", function () {
        chai_1.expect(function () { return builder.and(builder.equals('firstName', 'John')); })
            .to.throw();
        chai_1.expect(function () { return builder.or(builder.equals('firstName', 'John')); })
            .to.throw();
    });
    it("for NOT conjunction with simple clause", function () {
        var filter = builder.not(builder.equals('firstName', 'Jacob'));
        chai_1.expect(filter.toString()).to.equal("not firstName eq 'Jacob'");
    });
    it("for NOT conjunction with compound clause", function () {
        var filter = builder.not(builder.equals('firstName', 'Jacob').and(builder.greaterThan('age', 50)));
        chai_1.expect(filter.toString()).to.equal("not(firstName eq 'Jacob' and age gt 50)");
    });
    it("when no clause has been specified for a conjunction", function () {
        chai_1.expect(function () { return builder.not(builder); })
            .to.throw();
        chai_1.expect(function () { return builder.equals('firstName', 'Jackson').and(builder); })
            .to.throw();
        chai_1.expect(function () { return builder.equals('firstName', 'Jackson').or(builder); })
            .to.throw();
    });
});
