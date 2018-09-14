import { expect } from "chai";
import { ODataQuery } from "../../lib/expressions/ODataQuery";
import { ODataV4QueryProvider } from "../../lib/expressions/ODataV4QueryProvider";

describe("ODataQuery", () => {
    const endpoint = "/odata/users";
    const baseQuery = new ODataQuery<Person>(new ODataV4QueryProvider(endpoint));

    it("should produce base URL with no query", () => {
        expect(baseQuery.provider.buildQuery(baseQuery.expression)).to.be.eql(endpoint);
    });

    it("should set select filter", () => {
        const query = baseQuery.select("firstName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$select=firstName`);
    });

    it("should set select filter with mulitple fields", () => {        
        const query = baseQuery.select("firstName", "lastName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$select=firstName,lastName`);
    });

    it("should set combination select filter", () => {        
        const query = baseQuery.select("firstName", "lastName")
        .select("lastName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$select=lastName`);
    });

    it("should set orderBy", () => {
        const query = baseQuery.orderBy("firstName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$orderby=firstName`);
    });

    it("should set orderBy with multiple fields", () => {
        const query = baseQuery.orderBy("firstName", "lastName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$orderby=firstName,lastName`);
    });

    it("should set orderBy multiple times", () => {
        const query = baseQuery.orderBy("firstName", "lastName").orderBy("age");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$orderby=firstName,lastName,age`);
    });

    it("should set orderByDescending", () => {
        const query = baseQuery.orderByDescending("firstName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$orderby=firstName desc`);
    });

    it("should set orderByDescending with multiple fields", () => {
        const query = baseQuery.orderByDescending("firstName", "lastName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$orderby=firstName desc,lastName desc`);
    });

    it("should set orderByDescending multiple times", () => {
        const query = baseQuery.orderByDescending("firstName", "lastName").orderByDescending("age");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$orderby=firstName desc,lastName desc,age desc`);
    });

    it("should set orderBy and orderByDescending multiple times", () => {
        const query = baseQuery.orderByDescending("firstName").orderBy("age").orderByDescending("lastName");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$orderby=firstName desc,age,lastName desc`);
    });

    it("should set skip", () => {
        const query = baseQuery.skip(10);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$skip=10`);
    });

    it("should set last skip value provided", () => {
        const query = baseQuery.skip(10).skip(5);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$skip=5`);
    });

    it("should set top", () => {
        const query = baseQuery.top(10);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$top=10`);
    });

    it("should set last skip value provided", () => {
        const query = baseQuery.top(10).top(5);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$top=5`);
    });

    it("should set simple filter", () => {
        const query = baseQuery.filter(p => p.equals("firstName", "john"));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName eq 'john'`);
    });

    it("should set compound filter", () => {
        const query = baseQuery.filter(p => p.equals("firstName", "john").and(p.greaterThanOrEqualTo("age", 30)));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName eq 'john' and age ge 30`);
    });

    it("should set complex filter", () => {
        const query = baseQuery.filter(p => p.equals("firstName", "john").and(p.greaterThanOrEqualTo("age", 30).or(p.notEquals("lastName", "Jones"))));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName eq 'john' and (age ge 30 or lastName ne 'Jones')`);
    });
    
    it("should set complex filter", () => {
        const query = baseQuery.filter(p => p.equals("firstName", "john").and(p.greaterThanOrEqualTo("age", 30))
        .or(p.notEquals("lastName", "Jones").and(p.equals("email", ".com"))));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=(firstName eq 'john' and age ge 30) or (lastName ne 'Jones' and email eq '.com')`);
    });
});



interface Person{
    firstName: string;
    lastName: string;
    age: number;
    email: string;
}