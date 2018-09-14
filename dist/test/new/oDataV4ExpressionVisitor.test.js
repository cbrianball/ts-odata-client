"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var ODataV4ExpressionVisitor_1 = require("../../lib/expressions/ODataV4ExpressionVisitor");
var FieldReference_1 = require("../../lib/expressions/FieldReference");
var Expression_1 = require("../../lib/expressions/Expression");
describe("ODataV4ExpressionVisitor", function () {
    it("should handle single select", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("select" /* Select */, [new FieldReference_1.FieldReference("firstName"), new FieldReference_1.FieldReference("age")]);
        visitor.visit(expression);
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.orderBy).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.select).to.eql(["firstName", "age"]);
    });
    it("should handle compound select", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("select" /* Select */, [new FieldReference_1.FieldReference("firstName"), new FieldReference_1.FieldReference("age")]);
        visitor.visit(new Expression_1.Expression("select" /* Select */, [new FieldReference_1.FieldReference("lastName")], expression));
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.orderBy).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.select).to.eql(["lastName"]);
    });
    it("should handle orderBy", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        visitor.visit(new Expression_1.Expression("orderBy" /* OrderBy */, [new FieldReference_1.FieldReference("firstName")]));
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }]);
    });
    it("should handle compound orderBy", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("orderBy" /* OrderBy */, [new FieldReference_1.FieldReference("firstName")]);
        visitor.visit(new Expression_1.Expression("orderBy" /* OrderBy */, [new FieldReference_1.FieldReference("age")], expression));
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }, { field: "age" }]);
    });
    it("should handle orderByDescending", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        visitor.visit(new Expression_1.Expression("orderByDescending" /* OrderByDescending */, [new FieldReference_1.FieldReference("age")]));
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.orderBy).to.eql([{ field: "age", sort: 'desc' }]);
    });
    it("should handle compound orderByDescending", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("orderByDescending" /* OrderByDescending */, [new FieldReference_1.FieldReference("firstName")]);
        visitor.visit(new Expression_1.Expression("orderByDescending" /* OrderByDescending */, [new FieldReference_1.FieldReference("age")], expression));
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName", sort: 'desc' }, { field: "age", sort: 'desc' }]);
    });
    it("should handle single skip", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("skip" /* Skip */, [3]);
        visitor.visit(expression);
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.orderBy).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.eql(3);
    });
    it("should handle compound skip", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("skip" /* Skip */, [2]);
        visitor.visit(new Expression_1.Expression("skip" /* Skip */, [5], expression));
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.orderBy).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.eql(5);
    });
    it("should handle single top", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("top" /* Top */, [3]);
        visitor.visit(expression);
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.orderBy).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.eql(3);
    });
    it("should handle compound top", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression("top" /* Top */, [2]);
        visitor.visit(new Expression_1.Expression("top" /* Top */, [5], expression));
        chai_1.expect(visitor.oDataQuery.filter).to.be.empty;
        chai_1.expect(visitor.oDataQuery.orderBy).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.select).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.skip).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.top).to.eql(5);
    });
    it("should error on unknown expression", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression('fake operator', []);
        chai_1.expect(function () { return visitor.visit(expression); }).to.throw();
    });
});
