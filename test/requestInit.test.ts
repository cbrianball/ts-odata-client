import { ODataV4QueryProvider } from "../src/v4";
import { MockFetch } from "./mock-fetch";
import { describe, beforeEach, afterEach, it, expect } from "vitest";

interface Subject {
  SubjectId: string;
  SubjectClusterId: number;
  Name: string;
  Abbreviation: string;
}

let currentFetch!: MockFetch;

describe("requestInit", () => {
  const endpoint = "http://api.purdue.io/odata/Subjects";
  const oldFetch = global.fetch;

  beforeEach(() => {
    currentFetch = new MockFetch();
    global.fetch = currentFetch.fetch.bind(currentFetch);
  });

  afterEach(() => {
    global.fech = oldFetch;
  });

  it("should not error if not provided", async () => {
    const query = ODataV4QueryProvider.createQuery<Subject>(endpoint).filter((p) => p.Name.$contains("vet"));
    await query.getManyAsync();
    expect(currentFetch.lastInit).to.be.empty;
  });

  it("should use provided object in fetch", async () => {
    const requestInit: RequestInit = { method: "POST" };
    const query = ODataV4QueryProvider.createQuery<Subject>(endpoint, { requestInit: () => requestInit }).filter((p) =>
      p.Name.$contains("vet"),
    );
    await query.getManyAsync();
    expect(currentFetch.lastInit).to.equal(requestInit);
  });

  it("should use provided object via Promise in fetch", async () => {
    const requestInit: RequestInit = { method: "POST" };
    const query = ODataV4QueryProvider.createQuery<Subject>(endpoint, {
      requestInit: () => Promise.resolve(requestInit),
    }).filter((p) => p.Name.$contains("vet"));
    await query.getManyAsync();
    expect(currentFetch.lastInit).to.equal(requestInit);
  });
});
