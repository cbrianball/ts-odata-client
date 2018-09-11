import { ODataResponse } from "../odataResponse";
import { ODataQuery } from "./oDataQuery";
import { Expression } from "./expression";
export declare abstract class ODataQueryProvider {
    createQuery<T>(expression: Expression): ODataQuery<T>;
    abstract executeQueryAsync<T extends ODataResponse>(expression: Expression): T;
    generateQuery(expression: Expression): string;
    protected transformExpression(expression: Expression, query: Query): Query;
    protected buildODataString(query: Query): string;
    abstract deriveValue(value: any): string;
    private buildQuery;
}
declare type Sort = {
    field: string;
    direction?: 'desc';
};
interface Query {
    select?: string[];
    top?: number | undefined;
    skip?: number | undefined;
    count?: string | undefined;
    orderBy?: Sort[];
    key?: any;
    filter?: any;
}
export {};
