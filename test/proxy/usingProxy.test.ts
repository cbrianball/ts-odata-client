import { expect } from "chai";
import { ODataQuery } from "../../src";
import {usingProxy} from "../../src/lib/ProxyFilter";

describe("useProxy", () => {

    const endpoint = "/odata/users";
    const baseQuery = ODataQuery.forV4<Person>(endpoint);

    it("should set simple filter", () => {        
        const query = baseQuery.filter(usingProxy(p =>p.firstName.$equals("john")));
        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName eq 'john'")}`);
    });

    it("should set compound filter", () => {
        const query = baseQuery.filter(usingProxy(p => p.firstName.$equals("john").and(p.age.$greaterThanOrEqualTo(30))));
        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName eq 'john' and age ge 30")}`);
    });

    it("should set complex filter", () => {
        const query = baseQuery.filter(usingProxy(p => p.firstName.$equals("john").and(p.age.$greaterThanOrEqualTo(30).or(p.lastName.$notEqualTo("Jones")))));
        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName eq 'john' and (age ge 30 or lastName ne 'Jones')")}`);
    });

    it("should set complex filter", () => {
        const query = baseQuery.filter(usingProxy(p => p.firstName.$equals("john").and(p.age.$greaterThanOrEqualTo(30))
        .or(p.lastName.$notEqualTo("Jones").and(p.email.$equals(".com")))));        

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("(firstName eq 'john' and age ge 30) or (lastName ne 'Jones' and email eq '.com')")}`);
    });

    it("should handle contains", () => {
        const query = baseQuery.filter(usingProxy(p => p.firstName.$contains("jac")));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("contains(firstName,'jac')")}`);
    });

    it("should handle startsWith", () => {
        //const query = baseQuery.filter(p => p.startsWith("firstName", "jac"));
        const query = baseQuery.filter(usingProxy(p => p.firstName.$startsWith("jac")));

        expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("startsWith(firstName,'jac')")}`);
    });

    // it("should handle endsWith", () => {
    //     const query = baseQuery.filter(p => p.endsWith("firstName", "jac"));

    //     expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("endsWith(firstName,'jac')")}`);
    // });

    // it("should handle equals and notEquals", () => {
    //     const query = baseQuery.filter(p => p.equals("firstName", "jac").and(p.notEquals("age", 50)));

    //     expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName eq 'jac' and age ne 50")}`);
    // });

    // it("should handle greaterThan and greaterThanEqualTo", () => {
    //     const query = baseQuery.filter(p => p.greaterThan("firstName", "jac").and(p.greaterThanOrEqualTo("age", 50)));

    //     expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName gt 'jac' and age ge 50")}`);
    // });

    // it("should handle lessThan and lessThanEqualTo", () => {
    //     const query = baseQuery.filter(p => p.lessThan("firstName", "jac").and(p.lessThanOrEqualTo("age", 50)));

    //     expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName lt 'jac' and age le 50")}`);
    // });

    // it("should handle null comparisons", () => {
    //     const query = baseQuery.filter(p => p.equals("firstName", null));

    //     expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName eq null")}`);
    // });

    // it("should handle undefined comparisons", () => {
    //     const query = baseQuery.filter(p => p.equals("firstName", undefined));

    //     expect(query.provider.buildQuery(query.expression)).to.be.eql(`${endpoint}?$filter=${encodeURIComponent("firstName eq null")}`);
    // });
});

interface Person {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    children: string[];
    pets: string[];
}