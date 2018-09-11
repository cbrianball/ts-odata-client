"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var oDataV4ExpressionVisitor_1 = require("../../lib/new/oDataV4ExpressionVisitor");
var FieldReference_1 = require("../../lib/new/FieldReference");
describe("ODataV4ExpressionVisitor", function () {
    it("should handle select", function () {
        var visitor = new oDataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        visitor.visit('select', [new FieldReference_1.FieldReference("firstName"), new FieldReference_1.FieldReference("age")]);
        chai_1.expect(visitor.oDataQuery.orderBy.length).to.eql(0);
        chai_1.expect(visitor.oDataQuery.select).to.eql(["firstName", "age"]);
    });
    it("should handle orderBy", function () {
        var visitor = new oDataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        visitor.visit('orderBy', [new FieldReference_1.FieldReference("firstName"), new FieldReference_1.FieldReference("age")]);
        chai_1.expect(visitor.oDataQuery.select.length).to.eql(0);
        chai_1.expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }, { field: "age" }]);
    });
    it("should error on unknown expression", function () {
        var visitor = new oDataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        chai_1.expect(function () { return visitor.visit('fake operator', []); })
            .to.throw();
    });
});
