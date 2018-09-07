"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var odataProvider_1 = require("../lib/odataProvider");
describe('combining filter clauses', function () {
    var emptyProvider = new odataProvider_1.ODataProvider({ baseUrl: '/' });
    var field1Clause = "field1 eq 'abc'";
    var field2Clause = "field2 gt 5";
    var simpleClause = [field1Clause];
    var compoundAndClause = [field1Clause, "and", field2Clause];
    var compoundOrClause = [field1Clause, "or", field2Clause];
    var queryClause = odataProvider_1.ODataProvider.emptyClauses;
    queryClause.filter = ["field eq 'abc'"];
    it("where there isn't an existing filter clause", function () {
        var query = emptyProvider.createQuery({ filter: simpleClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause);
    });
    it("where an existing filter is combined with an empty filter clause", function () {
        var query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({});
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause);
    });
    it("where an existing filter is combined with a new filter clause", function () {
        var query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({ filter: simpleClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause + " and " + field1Clause);
    });
    it("where existing simple filter has a compound clause added to it", function () {
        var query = emptyProvider.createQuery({ filter: simpleClause }).createQuery({ filter: compoundOrClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause + " and (" + field1Clause + " or " + field2Clause + ")");
    });
    it("where existing compound clause has a simple filter added to it", function () {
        var query = emptyProvider.createQuery({ filter: compoundOrClause })
            .createQuery({ filter: simpleClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=(" + field1Clause + " or " + field2Clause + ") and " + field1Clause);
    });
    it("where existing compound clause has a compound clause added to it", function () {
        var query = emptyProvider.createQuery({ filter: compoundOrClause })
            .createQuery({ filter: compoundOrClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=(" + field1Clause + " or " + field2Clause + ") and (" + field1Clause + " or " + field2Clause + ")");
    });
    it("where existing compound clause has a compound claused added to it with ANDs only", function () {
        var query = emptyProvider.createQuery({ filter: compoundAndClause })
            .createQuery({ filter: compoundAndClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause + " and " + field2Clause + " and " + field1Clause + " and " + field2Clause);
    });
    it("where existing compound clause has a compound claused added to it with ORs and ANDs mixed", function () {
        var query = emptyProvider.createQuery({ filter: compoundOrClause })
            .createQuery({ filter: compoundAndClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=(" + field1Clause + " or " + field2Clause + ") and " + field1Clause + " and " + field2Clause);
    });
    it("where existing compound clause has a compound claused added to it with ANDs and ORs mixed", function () {
        var query = emptyProvider.createQuery({ filter: compoundAndClause })
            .createQuery({ filter: compoundOrClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause + " and " + field2Clause + " and (" + field1Clause + " or " + field2Clause + ")");
    });
    it("where simple filter added to complex filter with another simple filter added", function () {
        var query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({ filter: compoundAndClause })
            .createQuery({ filter: simpleClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause + " and " + field1Clause + " and " + field2Clause + " and " + field1Clause);
    });
    it("where simple filter added to complex filter with another simple filter added", function () {
        var query = emptyProvider.createQuery({ filter: simpleClause })
            .createQuery({ filter: compoundOrClause })
            .createQuery({ filter: simpleClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + field1Clause + " and (" + field1Clause + " or " + field2Clause + ") and " + field1Clause);
    });
});
