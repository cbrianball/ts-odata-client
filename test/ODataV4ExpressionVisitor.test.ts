import { expect } from "chai";
import { ODataV4ExpressionVisitor } from "../lib/ODataV4ExpressionVisitor";
import { FieldReference } from "../lib/FieldReference";
import { Expression } from "../lib/Expression";
import {ExpressionOperator} from "../lib/ExpressionOperator";


describe("ODataV4ExpressionVisitor", () => {
    it("should handle single select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Select, [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);
        visitor.visit(expression);

        expect(visitor.oDataQuery.filter).to.be.empty;
        expect(visitor.oDataQuery.orderBy).to.be.undefined;        
        expect(visitor.oDataQuery.skip).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;

        expect(visitor.oDataQuery.select).to.eql(["firstName", "age"]);
    });

    it("should handle compound select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Select, [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);
        visitor.visit(new Expression(ExpressionOperator.Select, [new FieldReference<Person>("lastName")], expression));

        expect(visitor.oDataQuery.filter).to.be.empty;
        expect(visitor.oDataQuery.orderBy).to.be.undefined;        
        expect(visitor.oDataQuery.skip).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;
        
        expect(visitor.oDataQuery.select).to.eql(["lastName"]);
    });

    it("should handle orderBy", () => {
        const visitor = new ODataV4ExpressionVisitor();        
        visitor.visit(new Expression(ExpressionOperator.OrderBy, [new FieldReference<Person>("firstName")]));

        expect(visitor.oDataQuery.filter).to.be.empty;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.skip).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;        

        expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }]);
    });

    it("should handle compound orderBy", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.OrderBy, [new FieldReference<Person>("firstName")]);
        visitor.visit(new Expression(ExpressionOperator.OrderBy, [new FieldReference<Person>("age")], expression));

        expect(visitor.oDataQuery.filter).to.be.empty;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.skip).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;        

        expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }, { field: "age" }]);
    });

    it("should handle orderByDescending", () => {
        const visitor = new ODataV4ExpressionVisitor();        
        visitor.visit(new Expression(ExpressionOperator.OrderByDescending, [new FieldReference<Person>("age")]));

        expect(visitor.oDataQuery.filter).to.be.empty;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.skip).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;        

        expect(visitor.oDataQuery.orderBy).to.eql([{ field: "age", sort: 'desc' }]);
    });

    it("should handle compound orderByDescending", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.OrderByDescending, [new FieldReference<Person>("firstName")]);
        visitor.visit(new Expression(ExpressionOperator.OrderByDescending, [new FieldReference<Person>("age")], expression));

        expect(visitor.oDataQuery.filter).to.be.empty;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.skip).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;        

        expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName", sort: 'desc' }, { field: "age", sort: 'desc' }]);
    });

    it("should handle single skip", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Skip, [3]);
        visitor.visit(expression);

        expect(visitor.oDataQuery.filter).to.be.empty;
        expect(visitor.oDataQuery.orderBy).to.be.undefined;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;

        expect(visitor.oDataQuery.skip).to.eql(3);
    });

    it("should handle compound skip", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Skip, [2]);
        visitor.visit(new Expression(ExpressionOperator.Skip, [5], expression));

        expect(visitor.oDataQuery.filter).to.be.empty;
        expect(visitor.oDataQuery.orderBy).to.be.undefined;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.top).to.be.undefined;
        
        expect(visitor.oDataQuery.skip).to.eql(5);
    });

    it("should handle single top", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Top, [3]);
        visitor.visit(expression);

        expect(visitor.oDataQuery.filter).to.be.empty;
        expect(visitor.oDataQuery.orderBy).to.be.undefined;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.skip).to.be.undefined;

        expect(visitor.oDataQuery.top).to.eql(3);
    });

    it("should handle compound top", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Top, [2]);
        visitor.visit(new Expression(ExpressionOperator.Top, [5], expression));

        expect(visitor.oDataQuery.filter).to.be.empty;
        expect(visitor.oDataQuery.orderBy).to.be.undefined;        
        expect(visitor.oDataQuery.select).to.be.undefined;
        expect(visitor.oDataQuery.skip).to.be.undefined;
        
        expect(visitor.oDataQuery.top).to.eql(5);
    });

    it("should error on unknown expression", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression('fake operator', []);

        expect(() => visitor.visit(expression)).to.throw();
    });
});

interface Person {
    firstName: string;
    lastName: string;
    age: number;
}