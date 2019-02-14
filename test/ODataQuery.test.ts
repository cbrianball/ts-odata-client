import { expect } from "chai";
import { ODataQuery } from "../src";
import { ODataV4QueryProvider } from "../src/v4";
import { ExcludeProperties } from "../src/lib/ExcludeProperties";

describe("ODataQuery", () => {
    const endpoint = "/odata/users";
    const baseQuery = new ODataQuery<Person, ExcludeProperties<Person, any[]>>(new ODataV4QueryProvider(endpoint));

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

    it("should ignore skip if set to 0", () => {
        const query = baseQuery.skip(0);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}`);
    });

    it("should set last skip value provided", () => {
        const query = baseQuery.skip(10).skip(5);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$skip=5`);
    });

    it("should set top", () => {
        const query = baseQuery.top(10);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$top=10`);
    });

    it("should set top to 0", () => {
        const query = baseQuery.top(0);

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$top=0`);
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

    it("should handle contains", () => {
        const query = baseQuery.filter(p => p.contains("firstName", "jac"));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=contains(firstName,'jac')`);
    });

    it("should handle startsWith", () => {
        const query = baseQuery.filter(p => p.startsWith("firstName", "jac"));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=startsWith(firstName,'jac')`);
    });

    it("should handle endsWith", () => {
        const query = baseQuery.filter(p => p.endsWith("firstName", "jac"));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=endsWith(firstName,'jac')`);
    });

    it("should handle equals and notEquals", () => {
        const query = baseQuery.filter(p => p.equals("firstName", "jac").and(p.notEquals("age", 50)));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName eq 'jac' and age ne 50`);
    });

    it("should handle greaterThan and greaterThanEqualTo", () => {
        const query = baseQuery.filter(p => p.greaterThan("firstName", "jac").and(p.greaterThanOrEqualTo("age", 50)));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName gt 'jac' and age ge 50`);
    });

    it("should handle lessThan and lessThanEqualTo", () => {
        const query = baseQuery.filter(p => p.lessThan("firstName", "jac").and(p.lessThanOrEqualTo("age", 50)));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName lt 'jac' and age le 50`);
    });

    it("should handle null comparisons", () => {
        const query = baseQuery.filter(p => p.equals("firstName", null));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName eq null`);
    });

    it("should handle undefined comparisons", () => {
        const query = baseQuery.filter(p => p.equals("firstName", undefined));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=firstName eq null`);
    });

    it("should handle cumulative expand", () => {
        const query = baseQuery.expand("children");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$expand=children`);
    });

    it("should handle cumulative expands", () => {
        const query = baseQuery.expand("children").expand("pets");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$expand=children,pets`);
    });

    it("should handle mulitple expands in one call", () => {
        const query = baseQuery.expand("children", "pets");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$expand=children,pets`);
    });

    it("should handle not repeat expands", () => {
        const query = baseQuery.expand("children", "pets").expand("pets");

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$expand=children,pets`);
    });
});

interface Person {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    children: string[];
    pets: string[];
}