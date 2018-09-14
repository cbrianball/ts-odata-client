"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var FieldReference_1 = require("./FieldReference");
var Expression_1 = require("./Expression");
var PredicateBuilder_1 = require("./PredicateBuilder");
var ODataQuery = /** @class */ (function () {
    /**
     *
     */
    function ODataQuery(provider, expression) {
        this.provider = provider;
        this.expression = expression;
    }
    /**
     * Limits the fields that are returned; the most recent call to select() will be used.
     * @param fields
     */
    ODataQuery.prototype.select = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        var expression = new Expression_1.Expression("select" /* Select */, fields.map(function (v) { return new FieldReference_1.FieldReference(v); }), this.expression);
        return this.provider.createQuery(expression);
    };
    /**
     * Returns the top n records; the most recent call to top() will be used.
     * @param n
     */
    ODataQuery.prototype.top = function (n) {
        var expression = new Expression_1.Expression("top" /* Top */, [n], this.expression);
        return this.provider.createQuery(expression);
    };
    /**
     * Omits the first n records from appear in the returned records; the most recent call to skip() will be used.
     * @param n
     */
    ODataQuery.prototype.skip = function (n) {
        var expression = new Expression_1.Expression("skip" /* Skip */, [n], this.expression);
        return this.provider.createQuery(expression);
    };
    /**
     * Determines the sort order (ascending) of the records; calls or orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    ODataQuery.prototype.orderBy = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        var expression = new Expression_1.Expression("orderBy" /* OrderBy */, fields.map(function (f) { return new FieldReference_1.FieldReference(f); }), this.expression);
        return this.provider.createQuery(expression);
    };
    /**
     * Determines the sort order (descending) of the records; calls to orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    ODataQuery.prototype.orderByDescending = function () {
        var fields = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fields[_i] = arguments[_i];
        }
        var expression = new Expression_1.Expression("orderByDescending" /* OrderByDescending */, fields.map(function (f) { return new FieldReference_1.FieldReference(f); }), this.expression);
        return this.provider.createQuery(expression);
    };
    /**
     * Filters the records based on the resulting FilterBuilder; calls to filter() and customFilter() are cumulative (as well as UNIONed (AND))
     * @param predicate Either an existing FilterBuilder, or a function that takes in an empty FilterBuilder and returns a FilterBuilder instance.
     */
    ODataQuery.prototype.filter = function (predicate) {
        if (typeof predicate === "function")
            predicate = predicate(new PredicateBuilder_1.PredicateBuilder());
        var expression = new Expression_1.Expression("predicate" /* Predicate */, [predicate], this.expression);
        return this.provider.createQuery(expression);
    };
    /**
     * Returns a single record with the provided key value. Some functions (such as top, skip, filter, etc.) are ignored when this function is invoked.
     * @param key
     */
    ODataQuery.prototype.getAsync = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var expression;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expression = new Expression_1.Expression('getByKey', [key], this.expression);
                        return [4 /*yield*/, this.provider.executeQueryAsync(expression)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns a set of records.
     */
    ODataQuery.prototype.getManyAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.provider.executeQueryAsync(this.expression)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns a set of records, including the total count of records, which may not be the same as the number of records return if the results are paginated.
     */
    ODataQuery.prototype.getManyWithCountAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var expression;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expression = new Expression_1.Expression('getWithCount', [], this.expression);
                        return [4 /*yield*/, this.provider.executeQueryAsync(expression)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ODataQuery;
}());
exports.ODataQuery = ODataQuery;
