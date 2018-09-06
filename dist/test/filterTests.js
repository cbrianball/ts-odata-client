"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var odataProvider_1 = require("../lib/odataProvider");
describe('combining filter clauses', function () {
    var emptyProvider = new odataProvider_1.ODataProvider({ baseUrl: '/' });
    var noFilterClause = [];
    var simpleFilterClause = ["field1 eq 'abc'"];
    var complexFilterClause = ["field2 eq 'xyz'", "(field3 eq 'stu' and field3 eq 'wxy')"];
    var queryClause = odataProvider_1.ODataProvider.emptyClauses;
    queryClause.filter = ["field eq 'abc'"];
    it("where there isn't an existing filter clause", function () {
        var query = emptyProvider.createQuery({ filter: simpleFilterClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + simpleFilterClause.join(""));
    });
    it("where an existing filter is combined with an empty filter clause", function () {
        var base = emptyProvider.createQuery({ filter: simpleFilterClause });
        var query = base.createQuery({});
        chai_1.expect(query.toString()).to.equal("/?$filter=" + simpleFilterClause.join(""));
    });
    it("where an existing filter is combined with a new filter clause", function () {
        var base = emptyProvider.createQuery({ filter: simpleFilterClause });
        var query = base.createQuery({ filter: simpleFilterClause });
        chai_1.expect(query.toString()).to.equal("/?$filter=" + simpleFilterClause.join("") + " and " + simpleFilterClause.join(""));
    });
});
