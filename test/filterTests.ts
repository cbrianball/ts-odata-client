import { expect } from "chai";

import { ODataProvider } from "../lib/odataProvider";

describe('combining filter clauses', () => {
    const emptyProvider = new ODataProvider({ baseUrl: '/' });

    const field1Clause = "field1 eq 'abc'";
    const field2Clause = "field2 gt 5";

    const simpleClause = [field1Clause];
    const compoundClause = [field1Clause, "or", field2Clause];

    const queryClause = ODataProvider.emptyClauses;
    queryClause.filter = ["field eq 'abc'"];

    it("where there isn't an existing filter clause", () => {
        const query = emptyProvider.createQuery({ filter: simpleClause });
        expect(query.toString()).to.equal(`/?$filter=${field1Clause}`);
    })

    it("where an existing filter is combined with an empty filter clause", () => {
        const base = emptyProvider.createQuery({ filter: simpleClause });
        const query = base.createQuery({});

        expect(query.toString()).to.equal(`/?$filter=${field1Clause}`);
    });

    it("where an existing filter is combined with a new filter clause", () => {
        const base = emptyProvider.createQuery({ filter: simpleClause });
        const query = base.createQuery({ filter: simpleClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and ${field1Clause}`);
    });

    it("where existing simple filter has a compound clause added to it", () => {
        const base = emptyProvider.createQuery({ filter: simpleClause });
        const query = base.createQuery({ filter: compoundClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and (${field1Clause} or ${field2Clause})`);
    });

    it("where existing compound cluase has a simple filter added to it", () => {
        const base = emptyProvider.createQuery({ filter: compoundClause });
        const query = base.createQuery({ filter: simpleClause });

        expect(query.toString()).to.equal(`/?$filter=(${field1Clause} or ${field2Clause}) and ${field1Clause}`);
    });

    it("where existing compound cluase has a compound clause added to it", () => {
        const base = emptyProvider.createQuery({ filter: compoundClause });
        const query = base.createQuery({ filter: compoundClause });

        expect(query.toString()).to.equal(`/?$filter=(${field1Clause} or ${field2Clause}) and (${field1Clause} or ${field2Clause})`);
    });
});