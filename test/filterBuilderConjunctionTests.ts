import { expect } from "chai";

import { FilterBuilder } from "../lib/filterBuilder";
import { ODataProvider } from "../lib/odataProvider";
import { ODataEndpoint } from "../lib/odataEndpoint";

interface User {
    firstName: string;
    lastName: string;
    age: number;
}

describe("combining conjunction clauses", () => {
    const provider = new ODataProvider({ baseUrl: '/' });
    const endpoint = new ODataEndpoint<User, User>(provider);
    const builder = FilterBuilder.for(endpoint);

    it("when all clauses are ANDs", () => {
        const filter = builder.equals('firstName', 'David').and(builder.equals('firstName', 'Joe').and(builder.greaterThan('age', 10)));

        expect(filter.toString()).to.equal("firstName eq 'David' and firstName eq 'Joe' and age gt 10");
    });

    it("when all clauses are Ors", () => {
        const filter = builder.equals('firstName', 'David').or(builder.equals('firstName', 'Joe').or(builder.greaterThan('age', 10)));

        expect(filter.toString()).to.equal("firstName eq 'David' or firstName eq 'Joe' or age gt 10");
    });

    it("when clauses are combination of OR and AND", () => {
        const filter = builder.equals('firstName', 'David').or(builder.equals('firstName', 'Joe').and(builder.greaterThan('age', 10)));

        expect(filter.toString()).to.equal("firstName eq 'David' or (firstName eq 'Joe' and age gt 10)");
    });

    it("when clauses are combination of AND and OR", () => {
        const filter = builder.equals('firstName', 'David').and(builder.equals('firstName', 'Joe').or(builder.greaterThan('age', 10)));

        expect(filter.toString()).to.equal("firstName eq 'David' and (firstName eq 'Joe' or age gt 10)");
    });

    it("when no initial clause has been set, should throw error", () =>{
        expect(() => builder.and(builder))
        .to.throw()
    });
});