import { expect } from "chai";
import { ODataV4ExpressionVisitor } from "../../lib/new/oDataV4ExpressionVisitor";
import { FieldReference } from "../../lib/new/FieldReference";

describe("ODataV4ExpressionVisitor", () => {
    it("should handle select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit('select', [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);

        expect(visitor.oDataQuery.orderBy.length).to.eql(0);
        expect(visitor.oDataQuery.select).to.eql(["firstName", "age"]);
    });

    it("should only take last select", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit('select', [new FieldReference<Person>("firstName"), new FieldReference<Person>("age")]);
        visitor.visit('select', [new FieldReference<Person>("lastName")]);

        expect(visitor.oDataQuery.orderBy.length).to.eql(0);
        expect(visitor.oDataQuery.select).to.eql(["lastName"]);
    });

    it("should handle orderBy", () => {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit('orderBy', [new FieldReference<Person>("firstName")]);
        visitor.visit('orderBy', [new FieldReference<Person>("age")]);

        expect(visitor.oDataQuery.select.length).to.eql(0);
        expect(visitor.oDataQuery.orderBy).to.eql([{ field: "firstName" }, { field: "age" }]);
    });

    it("should error on unknown expression", () => {
        const visitor = new ODataV4ExpressionVisitor();
        expect(() => visitor.visit('fake operator', []))
            .to.throw();
    });
});


interface Person {
    firstName: string;
    lastName: string;
    age: number;
}