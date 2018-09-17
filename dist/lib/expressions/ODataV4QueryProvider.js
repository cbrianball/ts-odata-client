"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var ODataQueryProvider_1 = require("./ODataQueryProvider");
var ODataV4ExpressionVisitor_1 = require("./ODataV4ExpressionVisitor");
var ODataV4QueryProvider = /** @class */ (function (_super) {
    __extends(ODataV4QueryProvider, _super);
    function ODataV4QueryProvider(basePath, requestInit) {
        var _this = _super.call(this) || this;
        _this.basePath = basePath;
        _this.requestInit = requestInit;
        return _this;
    }
    ODataV4QueryProvider.prototype.executeQueryAsync = function (expression) {
        return __awaiter(this, void 0, void 0, function () {
            var url, init, response, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        url = this.buildQuery(expression);
                        init = this.requestInit ? this.requestInit() : {};
                        return [4 /*yield*/, fetch(url, init)];
                    case 1:
                        response = _d.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _d.sent()];
                    case 3:
                        _a = Error.bind;
                        _c = (_b = JSON).stringify;
                        return [4 /*yield*/, response.json()];
                    case 4: throw new (_a.apply(Error, [void 0, _c.apply(_b, [_d.sent()])]))();
                }
            });
        });
    };
    ODataV4QueryProvider.prototype.buildQuery = function (expression) {
        return expression ? this.generateUrl(expression) : this.basePath;
    };
    ODataV4QueryProvider.prototype.generateUrl = function (expression) {
        var visitor = new ODataV4ExpressionVisitor_1.ODataV4ExpressionVisitor();
        visitor.visit(expression);
        var query = visitor.oDataQuery;
        var queryString = [];
        if (query.filter)
            queryString.push("$filter=" + query.filter);
        if (query.orderBy) {
            queryString.push("$orderby=" + query.orderBy.map(function (o) { return o.sort ? o.field + " " + o.sort : o.field; }).join(','));
        }
        if (query.select)
            queryString.push("$select=" + query.select);
        if (query.skip)
            queryString.push("$skip=" + query.skip);
        if (query.top)
            queryString.push("$top=" + query.top);
        if (queryString.length === 0)
            return this.basePath;
        return this.basePath + "?" + queryString.join('&');
    };
    return ODataV4QueryProvider;
}(ODataQueryProvider_1.ODataQueryProvider));
exports.ODataV4QueryProvider = ODataV4QueryProvider;
