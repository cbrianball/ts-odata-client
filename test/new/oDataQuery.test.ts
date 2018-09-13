import { expect } from "chai";
import { ODataQuery } from "../../lib/expressions/ODataQuery";
import { ODataV4QueryProvider } from "../../lib/expressions/ODataV4QueryProvider";

describe("ODataQuery", () => {
    it("should produce base URL with no query", () => {
        const query = new ODataQuery(new ODataV4QueryProvider("/odata/users"));

        expect(query.provider.buildQuery(query.expression)).to.be.eql("/odata/users");
    });

    it("should set select filter", () => {
        const query = new ODataQuery<Person>(new ODataV4QueryProvider("/odata/users"))
        .select("firstName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql("/odata/users?$select=firstName");
    });

    it("should set select filter with mulitple fields", () => {
        const query = new ODataQuery<Person>(new ODataV4QueryProvider("/odata/users"))
        .select("firstName", "lastName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql("/odata/users?$select=firstName,lastName");
    });

    it("should set combination select filter", () => {
        const query = new ODataQuery<Person>(new ODataV4QueryProvider("/odata/users"))
        .select("firstName", "lastName")
        .select("lastName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql("/odata/users?$select=lastName");
    });
});


interface Person{
    firstName: string;
    lastName: string;
    age: number;
}