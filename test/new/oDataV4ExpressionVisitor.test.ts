import { expect } from "chai";
import { ODataV4ExpressionVisitor } from "../../lib/expressions/ODataV4ExpressionVisitor";
import { FieldReference } from "../../lib/expressions/FieldReference";
import { Expression, TypedExpression } from "../../lib/expressions/Expression";
import { PredicateBuilder } from "../../lib/expressions/PredicateBuilder";

describe("ODataV4ExpressionVisitor", () => {
    it("should handle select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression('select', [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);
        visitor.visit(expression);

        expect(visitor.oDataQuery.orderBy.length).to.eql(0);
        expect(visitor.oDataQuery.select).to.eql(["firstName", "age"]);
    });

    it("should only take last select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression('select', [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);
        visitor.visit(new Expression('select', [new FieldReference<Person>("lastName")], expression));        

        expect(visitor.oDataQuery.orderBy.length).to.eql(0);
        expect(visitor.oDataQuery.select).to.eql(["lastName"]);
    });

    it("should handle orderBy", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression('orderBy', [new FieldReference<Person>("firstName")]);
        visitor.visit(new Expression('orderBy', [new FieldReference<Person>("age")], expression));

        expect(visitor.oDataQuery.select.length).to.eql(0);
        expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }, { field: "age" }]);
    });

    it("should error on unknown expression", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression('fake operator', []);
        expect(() => visitor.visit(expression))
            .to.throw();
    });
});

describe("test",() =>{
    it("tree", () =>{
        const f = new PredicateBuilder<Person>();
        const result = f.equals("firstName", "bob").and(f.lessThan("age", 30)).or(f.greaterThan("lastName", "tom"));

        const result1 = f.equals("firstName", "bob").and(f.lessThan("age", 30).or(f.greaterThan("lastName", "tom")));
        debugger;
    });
});


interface Person {
    firstName: string;
    lastName: string;
    age: number;
}