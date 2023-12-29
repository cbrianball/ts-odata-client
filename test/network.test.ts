import { ODataV4QueryProvider } from "../src/v4";
import { describe, it, expect } from "vitest";

interface Subject {
    SubjectId: string,
    SubjectClusterId: number,
    Name: string;
    Abbreviation: string;
}

//do not run this test by default
describe.skip("executing getManyAsync", () => {

    const endpoint = "http://api.purdue.io/odata/Subjects";
    const baseQuery = ODataV4QueryProvider.createQuery<Subject>(endpoint);

    it("should not error", async () => {
        const query = baseQuery.filter(p => p.Name.$contains("vet"));

        const results = await query.getManyAsync();

        expect(results).to.not.be.undefined;
        expect(results.value).to.not.be.undefined;
        results.value.forEach(v => expect(v.Name).to.match(/vet/i));
    });
});