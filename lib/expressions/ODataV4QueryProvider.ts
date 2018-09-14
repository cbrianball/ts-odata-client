import { ODataQueryProvider } from "./ODataQueryProvider";
import { Expression } from "./Expression";
import { ODataResponse } from "../odataResponse";
import { ODataV4ExpressionVisitor } from "./ODataV4ExpressionVisitor";

export class ODataV4QueryProvider extends ODataQueryProvider {

    constructor(private readonly basePath: string, private readonly requestInit?: () => RequestInit) {
        super();
    }

    async executeQueryAsync<T extends ODataResponse>(expression?: Expression) {
        const url = this.buildQuery(expression);
        
        const init = this.requestInit ? this.requestInit() : {};

        const response = await fetch(url, init);

        return await response.json() as T;
    }

    buildQuery(expression?: Expression) {
        return expression ? this.generateUrl(expression) : this.basePath;
    }

    private generateUrl(expression: Expression) {
        const visitor = new ODataV4ExpressionVisitor();
        visitor.visit(expression);

        const query = visitor.oDataQuery;

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

        if(queryString.length === 0) return this.basePath;

        return `${this.basePath}?${queryString.join('&')}`;
    }
}