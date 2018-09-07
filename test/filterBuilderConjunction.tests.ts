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

    it("when all clauses are ORs", () => {
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

    it("when clauses are nested multiple levels", () => {
        const filter = builder.equals('firstName', 'Jack').and(builder.equals('lastName', 'Smith').or(builder.lessThanOrEqualTo('age', 20).and(builder.equals('lastName', 'Chang'))));

        expect(filter.toString()).to.equal("firstName eq 'Jack' and (lastName eq 'Smith' or (age le 20 and lastName eq 'Chang'))");
    });

    it("when clauses are nested multiple levels(2)", () => {
        const filter = builder.equals('firstName', 'Jack')
        .and(builder.equals('lastName', 'Smith').or(builder.lessThanOrEqualTo('age', 20).or(builder.equals('lastName', 'Chang'))));

        expect(filter.toString()).to.equal("firstName eq 'Jack' and (lastName eq 'Smith' or age le 20 or lastName eq 'Chang')");
    });

    it("when no initial clause has been set, should throw error", () =>{
        expect(() => builder.and(builder.equals('firstName', 'John')))
        .to.throw()

        expect(() => builder.or(builder.equals('firstName', 'John')))
        .to.throw();
    });

    it("for NOT conjunction with simple clause", () =>{
        const filter = builder.not(builder.equals('firstName', 'Jacob'));

        expect(filter.toString()).to.equal("not firstName eq 'Jacob'");
    });

    it("for NOT conjunction with compound clause", () =>{
        const filter = builder.not(builder.equals('firstName', 'Jacob').and(builder.greaterThan('age', 50)));

        expect(filter.toString()).to.equal("not(firstName eq 'Jacob' and age gt 50)");
    });

    it("when no clause has been specified for a conjunction", () =>{
        expect(() => builder.not(builder))
        .to.throw();

        expect(() => builder.equals('firstName', 'Jackson').and(builder))
        .to.throw();

        expect(() => builder.equals('firstName', 'Jackson').or(builder))
        .to.throw();
    });
});