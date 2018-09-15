import { expect } from "chai";
import { ODataQuery } from "../../lib/expressions/ODataQuery";
import { ODataV4QueryProvider } from "../../lib/expressions/ODataV4QueryProvider";
import fetch from "node-fetch";

(global as any).fetch = fetch;

interface Subject {
    SubjectId: string,
    SubjectClusterId: number,
    Name: string;
    Abbreviation: string;
}

xdescribe("executing getManyAsync", () => {

    const endpoint = "http://api.purdue.io/odata/Subjects";
    const baseQuery = new ODataQuery<Subject>(new ODataV4QueryProvider(endpoint));

    it("should not error", () => {
        const query = baseQuery.filter(p => p.contains("Name", "vet"));
        
        expect(async () => await query.getManyAsync()).to.not.throw;        
    });
});