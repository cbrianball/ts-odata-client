import { ODataQuery } from "../src";
import { MockFetch } from "./mock-fetch";
import { describe, beforeEach, afterEach, it, expect } from "vitest";

describe("ODataQuery", () => {
  const endpoint = "/odata/users";
  const baseQuery = ODataQuery.forV4<Person>(endpoint);
  let currentFetch!: MockFetch;
  const oldFetch = global.fetch;

  beforeEach(() => {
    currentFetch = new MockFetch();
    global.fetch = currentFetch.fetch.bind(currentFetch);
  });

  afterEach(() => {
    global.fech = oldFetch;
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
    expect(url).to.equal(endpoint + "/$value");
  });

  it("should transform results", async () => {
    const query = baseQuery.select((u) => ({ id: u.age, name: { first: u.firstName } }));
    const result = await query.getManyAsync();

    expect(result).to.be.eql({ value: [{ id: undefined, name: { first: undefined } }] });
  });

  it("should allow use of for await...of operator", async () => {
    const query = baseQuery.select((u) => ({ id: u.age, name: { first: u.firstName } }));
    let counter = 0;

    for await (const person of query) {
      counter++;
      expect(person).to.toEqual({ id: undefined, name: { first: undefined } });
    }

    expect(counter).toBe(1);
  });

  it("should not enter for await...of loop if no results are returned", async () => {
    const query = baseQuery.select((u) => ({ id: u.age, name: { first: u.firstName } }));
    let counter = 0;
    currentFetch.nextResponse = new Response(`{"value":[]}`, { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of query) {
      counter++;
    }

    expect(counter).toBe(0);
  });

  it("should invoke multiple network calls if needed in for await ... of", async () => {
    const query = baseQuery.select((u) => ({ id: u.age, name: { first: u.firstName } }));
    currentFetch.nextResponse = new Response(`{"value":[{}], "@odata.nextLink": "/odata/users?$skip=10&$take=10"}`, {
      status: 200,
    });
    let counter = 0;

    for await (const person of query) {
      currentFetch.nextResponse = new Response(`{"value":[{}]}`, { status: 200 });
      counter++;
      expect(person).to.toEqual({ id: undefined, name: { first: undefined } });
    }

    expect(counter).toBe(2);
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
