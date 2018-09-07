import { expect } from "chai";

import { ODataProvider } from "../lib/odataProvider";

describe('combining filter clauses', () => {
    const emptyProvider = new ODataProvider({ baseUrl: '/' });

    const field1Clause = "field1 eq 'abc'";
    const field2Clause = "field2 gt 5";

    const simpleClause = [field1Clause];
    const compoundAndClause = [field1Clause, "and", field2Clause];
    const compoundOrClause = [field1Clause, "or", field2Clause];

    const queryClause = ODataProvider.emptyClauses;
    queryClause.filter = ["field eq 'abc'"];

    it("where there isn't an existing filter clause", () => {
        const query = emptyProvider.createQuery({ filter: simpleClause });
        expect(query.toString()).to.equal(`/?$filter=${field1Clause}`);
    })

    it("where an existing filter is combined with an empty filter clause", () => {
        const query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({});

        expect(query.toString()).to.equal(`/?$filter=${field1Clause}`);
    });

    it("where an existing filter is combined with a new filter clause", () => {
        const query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({ filter: simpleClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and ${field1Clause}`);
    });

    it("where existing simple filter has a compound clause added to it", () => {
        const query = emptyProvider.createQuery({ filter: simpleClause }).createQuery({ filter: compoundOrClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and (${field1Clause} or ${field2Clause})`);
    });

    it("where existing compound clause has a simple filter added to it", () => {
        const query = emptyProvider.createQuery({ filter: compoundOrClause })
            .createQuery({ filter: simpleClause });

        expect(query.toString()).to.equal(`/?$filter=(${field1Clause} or ${field2Clause}) and ${field1Clause}`);
    });

    it("where existing compound clause has a compound clause added to it", () => {
        const query = emptyProvider.createQuery({ filter: compoundOrClause })
            .createQuery({ filter: compoundOrClause });

        expect(query.toString()).to.equal(`/?$filter=(${field1Clause} or ${field2Clause}) and (${field1Clause} or ${field2Clause})`);
    });

    it("where existing compound clause has a compound claused added to it with ANDs only", () => {
        const query = emptyProvider.createQuery({ filter: compoundAndClause })
            .createQuery({ filter: compoundAndClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and ${field2Clause} and ${field1Clause} and ${field2Clause}`);
    });

    it("where existing compound clause has a compound claused added to it with ORs and ANDs mixed", () => {
        const query = emptyProvider.createQuery({ filter: compoundOrClause })
            .createQuery({ filter: compoundAndClause });

        expect(query.toString()).to.equal(`/?$filter=(${field1Clause} or ${field2Clause}) and ${field1Clause} and ${field2Clause}`);
    });

    it("where existing compound clause has a compound claused added to it with ANDs and ORs mixed", () => {
        const query = emptyProvider.createQuery({ filter: compoundAndClause })
            .createQuery({ filter: compoundOrClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and ${field2Clause} and (${field1Clause} or ${field2Clause})`);
    });

    it("where simple filter added to complex filter with another simple filter added", () => {
        const query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({ filter: compoundAndClause })
            .createQuery({ filter: simpleClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and ${field1Clause} and ${field2Clause} and ${field1Clause}`);
    });

    it("where simple filter added to complex filter with another simple filter added", () => {
        const query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({ filter: compoundOrClause })
            .createQuery({ filter: simpleClause });

        expect(query.toString()).to.equal(`/?$filter=${field1Clause} and (${field1Clause} or ${field2Clause}) and ${field1Clause}`);
    });
});