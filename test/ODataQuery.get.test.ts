import { ODataQuery } from "../src";
import { MockFetch } from "./mock-fetch";
import { describe, beforeEach, afterEach, it, expect } from "vitest";

describe("ODataQuery", () => {
    const endpoint = "/odata/users";
    const baseQuery = ODataQuery.forV4<Person>(endpoint);
    let currentFetch!: MockFetch;
    const oldFetch = (global as any).fetch;

    beforeEach(() => {
        currentFetch = new MockFetch();
        (global as any).fetch = currentFetch.fetch.bind(currentFetch);
    });

    afterEach(() => {
        (global as any).fech = oldFetch;
    });

    it("should produce base URL with no query", () => {
        baseQuery.getManyAsync();
        const lastRequest = currentFetch.lastRequest!;
        const url = typeof lastRequest === "string" ? lastRequest : lastRequest.url;
        expect(url).to.equal(endpoint);
    });

    it("should produce base URL with key and no query", () => {
        baseQuery.getAsync(123);
        const lastRequest = currentFetch.lastRequest!;
        const url = typeof lastRequest === "string" ? lastRequest : lastRequest.url;
        expect(url).to.equal(endpoint + `(123)`);
    });

    it("should produce base URL with $value and no query", () => {
        baseQuery.getValueAsync();
        const lastRequest = currentFetch.lastRequest!;
        const url = typeof lastRequest === "string" ? lastRequest : lastRequest.url;
        expect(url).to.equal(endpoint + '/$value');
    });

    it("should transform results", async () => {
        const query = baseQuery.select(u => ({ id: u.age, name: { first: u.firstName } }));
        const result = await query.getManyAsync();

        expect(result).to.be.eql({ value: [{ id: undefined, name: { first: undefined } }] });
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