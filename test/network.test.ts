import { expect } from "chai";
import { ODataV4QueryProvider } from "../src/v4";
import fetch from "node-fetch";

(global as any).fetch = fetch;

interface Subject {
    SubjectId: string,
    SubjectClusterId: number,
    Name: string;
    Abbreviation: string;
}

//do not run this test by default
xdescribe("executing getManyAsync", () => {

    const endpoint = "http://api.purdue.io/odata/Subjects";
    const baseQuery = ODataV4QueryProvider.createQuery<Subject>(endpoint);

    it("should not error", async () => {
        const query = baseQuery.filter(p => p.Name.$contains("vet"));

        let results = await query.getManyAsync();

        expect(results).to.not.be.undefined;
        expect(results.value).to.not.be.undefined;
        results.value.forEach(v => expect(v.Name).to.match(/vet/i));
    });
});