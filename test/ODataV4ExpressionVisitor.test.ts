import { expect } from "chai";
import { ODataV4ExpressionVisitor } from "../src/lib/ODataV4ExpressionVisitor";
import { FieldReference } from "../src/lib/FieldReference";
import { Expression } from "../src/lib/Expression";
import { ExpressionOperator } from "../src/lib/ExpressionOperator";
import { ODataType } from "../src/lib/ODataType";


describe("ODataV4ExpressionVisitor", () => {
    it("should handle single select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Select, [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);
        visitor.visit(expression);

        expect(visitor.oDataQuery).to.eql({ select: ["firstName", "age"] });
    });

    it("should handle compound select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Select, [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);
        visitor.visit(new Expression(ExpressionOperator.Select, [new FieldReference<Person>("lastName")], expression));

        expect(visitor.oDataQuery).to.eql({ select: ["lastName"] });
    });

    it("should handle orderBy", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.OrderBy, [new FieldReference<Person>("firstName")]));

        expect(visitor.oDataQuery).to.eql({ orderBy: [{ field: "firstName" }] });
    });

    it("should handle compound orderBy", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.OrderBy, [new FieldReference<Person>("firstName")]);
        visitor.visit(new Expression(ExpressionOperator.OrderBy, [new FieldReference<Person>("age")], expression));

        expect(visitor.oDataQuery).to.eql({ orderBy: [{ field: "firstName" }, { field: "age" }] });
    });

    it("should handle orderByDescending", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.OrderByDescending, [new FieldReference<Person>("age")]));

        expect(visitor.oDataQuery).to.eql({ orderBy: [{ field: "age", sort: 'desc' }] });
    });

    it("should handle compound orderByDescending", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.OrderByDescending, [new FieldReference<Person>("firstName")]);
        visitor.visit(new Expression(ExpressionOperator.OrderByDescending, [new FieldReference<Person>("age")], expression));

        expect(visitor.oDataQuery).to.eql({ orderBy: [{ field: "firstName", sort: 'desc' }, { field: "age", sort: 'desc' }] });
    });

    it("should handle single skip", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Skip, [3]);
        visitor.visit(expression);

        expect(visitor.oDataQuery).to.eql({ skip: 3 });
    });

    it("should handle compound skip", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Skip, [2]);
        visitor.visit(new Expression(ExpressionOperator.Skip, [5], expression));

        expect(visitor.oDataQuery).to.eql({ skip: 5 });
    });

    it("should handle single top", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Top, [3]);
        visitor.visit(expression);

        expect(visitor.oDataQuery).to.eql({ top: 3 });
    });

    it("should handle compound top", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression(ExpressionOperator.Top, [2]);
        visitor.visit(new Expression(ExpressionOperator.Top, [5], expression));

        expect(visitor.oDataQuery).to.eql({ top: 5 });
    });

    it("should handle count", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.GetWithCount, []));

        expect(visitor.oDataQuery).to.eql({ count: true });
    });

    it("should handle getByKey with number", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.GetByKey, [5]));

        expect(visitor.oDataQuery).to.eql({ key: "5" });
    });

    it("should handle getByKey with string", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.GetByKey, ["1a"]));

        expect(visitor.oDataQuery).to.eql({ key: "'1a'" });
    });

    it("should handle getByKey with date", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.GetByKey, [Expression.literal(new Date(0), ODataType.Date)]));

        expect(visitor.oDataQuery).to.eql({ key: "1970-01-01" });
    });

    it("should handle getByKey with guid", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.GetByKey, [Expression.literal("00000000-0000-0000-000000000000", ODataType.Guid)]));

        expect(visitor.oDataQuery).to.eql({ key: "00000000-0000-0000-000000000000" });
    });

    it("should handle expand", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(new Expression(ExpressionOperator.Expand, [new FieldReference<Person>("children")]));

        expect(visitor.oDataQuery).to.eql({ expand: ["children"] });
    });

    it("should error on unknown expression", () => {
        const visitor = new ODataV4ExpressionVisitor();
        const expression = new Expression('fake operator' as ExpressionOperator, []);

        expect(() => visitor.visit(expression)).to.throw();
    });
});

interface Person {
    firstName: string;
    lastName: string;
    age: number;
    children: string[];
}