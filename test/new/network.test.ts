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

// describe("abc", () => {

//     const endpoint = "http://api.purdue.io/odata/Subjects";
//     const baseQuery = new ODataQuery<Subject>(new ODataV4QueryProvider(endpoint));

//     it("def", async () => {
//         const query = baseQuery.filter(p => p.equals("SubjectClusterId", 25));
//         const results = await query.getManyAsync();
//     });
// });