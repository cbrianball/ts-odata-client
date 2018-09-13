"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var ODataV4ExpressionVisitor_1 = require("../../lib/expressions/ODataV4ExpressionVisitor");
var FieldReference_1 = require("../../lib/expressions/FieldReference");
var Expression_1 = require("../../lib/expressions/Expression");
var PredicateBuilder_1 = require("../../lib/expressions/PredicateBuilder");
describe("ODataV4ExpressionVisitor", function () {
    it("should handle select", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression('select', [new FieldReference_1.FieldReference("firstName"), new FieldReference_1.FieldReference("age")]);
        visitor.visit(expression);
        chai_1.expect(visitor.oDataQuery.orderBy).to.not.be.undefined;
        if (visitor.oDataQuery.orderBy)
            chai_1.expect(visitor.oDataQuery.orderBy.length).to.eql(0);
        chai_1.expect(visitor.oDataQuery.select).to.eql(["firstName", "age"]);
    });
    it("should only take last select", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression('select', [new FieldReference_1.FieldReference("firstName"), new FieldReference_1.FieldReference("age")]);
        visitor.visit(new Expression_1.Expression('select', [new FieldReference_1.FieldReference("lastName")], expression));
        chai_1.expect(visitor.oDataQuery.orderBy).to.be.undefined;
        chai_1.expect(visitor.oDataQuery.select).to.eql(["lastName"]);
    });
    it("should handle orderBy", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression('orderBy', [new FieldReference_1.FieldReference("firstName")]);
        visitor.visit(new Expression_1.Expression('orderBy', [new FieldReference_1.FieldReference("age")], expression));
        chai_1.expect(visitor.oDataQuery.select).to.not.be.undefined;
        if (visitor.oDataQuery.select)
            chai_1.expect(visitor.oDataQuery.select.length).to.eql(0);
        chai_1.expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }, { field: "age" }]);
    });
    it("should error on unknown expression", function () {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        var expression = new Expression_1.Expression('fake operator', []);
        chai_1.expect(function () { return visitor.visit(expression); })
            .to.throw();
    });
});
describe("test", function () {
    it("tree", function () {
        var f = new PredicateBuilder_1.PredicateBuilder();
        var result = f.equals("firstName", "bob").and(f.lessThan("age", 30)).or(f.greaterThan("lastName", "tom"));
        var result1 = f.equals("firstName", "bob").and(f.lessThan("age", 30).or(f.greaterThan("lastName", "tom")));
        debugger;
    });
});
