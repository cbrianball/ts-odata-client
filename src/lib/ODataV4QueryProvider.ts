import { ODataQueryProvider } from "./ODataQueryProvider";
import { Expression } from "./Expression";
import { ODataResponse } from "./ODataResponse";
import { ODataV4ExpressionVisitor, ODataV4QuerySegments } from "./ODataV4ExpressionVisitor";
import { ExcludeProperties } from "./ExcludeProperties";

/**
 * A class used to generate queries that will ultimately be translated into ODataV4 queries.
 * Consumed by ODataContext classes; can also be used directly in lieu of creating an ODataContext class.
 */
export class ODataV4QueryProvider extends ODataQueryProvider {

    constructor(private readonly path: string, private readonly requestInit?: () => RequestInit) {
        super();
    }

    static createQuery<T>(path: string, requestInit?: () => RequestInit) {
        return new ODataV4QueryProvider(path, requestInit)
            .createQuery<T, ExcludeProperties<T, any[]>>();
    }

    async executeQueryAsync<T extends ODataResponse>(expression?: Expression) {
        const url = this.buildQuery(expression);

        const init = this.requestInit ? this.requestInit() : {};

        const response = await fetch(url, init);

        if (response.ok) return await response.json() as T;

        throw new Error(JSON.stringify(await response.json()));
    }

    buildQuery(expression?: Expression) {
        return expression ? this.generateUrl(expression) : this.path;
    }

    private generateUrl(expression: Expression) {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(expression);

        let path = this.path;

        if (visitor.oDataQuery.key)
            path += `(${visitor.oDataQuery.key})`;

        const queryString = this.buildQueryString(visitor.oDataQuery);

        return path + queryString;
    }

    private buildQueryString(query: ODataV4QuerySegments) {
        const queryString: string[] = [];

        if (query.filter)
            queryString.push("$filter=" + query.filter);

        if (query.orderBy) {
            queryString.push("$orderby=" + query.orderBy.map(o => o.sort ? `${o.field} ${o.sort}` : o.field).join(','));
        }

        if (query.select)
            queryString.push("$select=" + query.select);

        if (query.skip)
            queryString.push("$skip=" + query.skip);

        if (query.top)
            queryString.push("$top=" + query.top);

        if (query.count)
            queryString.push("$count=true");

        if (query.expand)
            queryString.push("$expand=" + query.expand)

        if (queryString.length > 0) return '?' + queryString.join("&");
        return "";
    }
}