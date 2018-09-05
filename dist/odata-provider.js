"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ODataProvider = /** @class */ (function () {
    function ODataProvider(remoteInformation, queryClauses) {
        if (queryClauses === void 0) { queryClauses = ODataProvider.emptyClauses; }
        this.remoteInformation = remoteInformation;
        this.queryClauses = queryClauses;
        if (!remoteInformation || !remoteInformation.baseUrl)
            throw Error('remoteInformation.baseUrl is required');
        this.queryClauses = this.queryClauses || ODataProvider.emptyClauses;
    }
    Object.defineProperty(ODataProvider, "emptyClauses", {
        get: function () {
            return {
                count: false,
                key: null,
                select: [],
                top: 0,
                skip: 0,
                orderBy: [],
                filter: ""
            };
        },
        enumerable: true,
        configurable: true
    });
    ODataProvider.prototype.createQuery = function (clauses) {
        var newClauses = __assign({}, ODataProvider.emptyClauses, clauses);
        return new ODataProvider(this.remoteInformation, this.mergeQueryClauses(this.queryClauses, newClauses));
    };
    ODataProvider.prototype.executeAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestInit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestInit = {};
                        if (typeof this.remoteInformation.headersCallback === "function")
                            requestInit = this.remoteInformation.headersCallback();
                        return [4 /*yield*/, executeAsync(this.toString(), requestInit)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ODataProvider.prototype.mergeQueryClauses = function (previous, next) {
        return {
            count: next.count || previous.count,
            key: next.key || previous.key,
            filter: (previous.filter && next.filter) ? this.groupFilterClauseIfNeeded(previous.filter.trim()) + ' and ' + this.groupFilterClauseIfNeeded(next.filter.trim()) : (next.filter || previous.filter),
            orderBy: previous.orderBy.concat(next.orderBy),
            select: next.select.length > 0 ? next.select : previous.select,
            skip: next.skip || previous.skip,
            top: next.top || previous.top,
        };
    };
    ODataProvider.prototype.groupFilterClauseIfNeeded = function (filterClause) {
        if (!filterClause)
            return;
        //look for "and" or "or" with a space on either side to determine if this is a filter with multiple criteria
        var result = / and | or /i.test(filterClause);
        if (result)
            return "(" + filterClause + ")";
        return filterClause;
    };
    ODataProvider.prototype.toString = function () {
        var queryString = [];
        if (!this.queryClauses.key && this.queryClauses.filter)
            queryString.push("$filter=" + this.queryClauses.filter);
        if (!this.queryClauses.key && this.queryClauses.orderBy.length > 0)
            queryString.push("$orderby=" + this.queryClauses.orderBy.join(','));
        if (this.queryClauses.select.length > 0)
            queryString.push("$select=" + this.queryClauses.select.join(','));
        if (!this.queryClauses.key && this.queryClauses.top)
            queryString.push("$top=" + this.queryClauses.top);
        if (!this.queryClauses.key && this.queryClauses.skip)
            queryString.push("$skip=" + this.queryClauses.skip);
        if (!this.queryClauses.key && this.queryClauses.count)
            queryString.push('$count=true');
        var value = this.remoteInformation.baseUrl;
        if (this.queryClauses.key)
            value += "(" + this.queryClauses.key + ")";
        if (queryString.length > 0)
            value += '?' + queryString.join('&');
        return value;
    };
    return ODataProvider;
}());
function executeAsync(url, requestInit) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url, requestInit)];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw Error("Server Error\r\n Status: " + response.status + "\r\n Status Text: " + response.statusText);
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
