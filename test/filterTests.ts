import { expect } from "chai";

import { ODataProvider } from "../lib/odataProvider";

describe('combining filter clauses', () => {
    const emptyProvider = new ODataProvider({ baseUrl: '/' });

    const noFilterClause: string[] = [];
    const simpleFilterClause = ["field1 eq 'abc'"];
    const complexFilterClause = ["field2 eq 'xyz'", "(field3 eq 'stu' and field3 eq 'wxy')"]

    const queryClause = ODataProvider.emptyClauses;
    queryClause.filter = ["field eq 'abc'"];

    it("where there isn't an existing filter clause", () => {
        const query = emptyProvider.createQuery({ filter: simpleFilterClause });
        expect(query.toString()).to.equal(`/?$filter=${simpleFilterClause.join("")}`);
    })

    it("where an existing filter is combined with an empty filter clause", () => {
        const base = emptyProvider.createQuery({ filter: simpleFilterClause });
        const query = base.createQuery({});

        expect(query.toString()).to.equal(`/?$filter=${simpleFilterClause.join("")}`);
    });

    it("where an existing filter is combined with a new filter clause", () => {
        const base = emptyProvider.createQuery({ filter: simpleFilterClause });
        const query = base.createQuery({ filter: simpleFilterClause });

        expect(query.toString()).to.equal(`/?$filter=${simpleFilterClause.join("")} and ${simpleFilterClause.join("")}`);
    })
})