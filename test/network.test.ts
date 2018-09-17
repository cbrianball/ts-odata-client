import { expect } from "chai";
import { ODataQuery } from "../lib/ODataQuery";
import { ODataV4QueryProvider } from "../lib/ODataV4QueryProvider";
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
    const baseQuery = new ODataQuery<Subject>(new ODataV4QueryProvider(endpoint));

    it("should not error", async () => {
        const query = baseQuery.filter(p => p.contains("Name", "vet"));

        let results = await query.getManyAsync();

        expect(results).to.not.be.undefined;
        expect(results.value).to.not.be.undefined;
        results.value.forEach(v => expect(v.Name).to.match(/vet/i));
    });
});