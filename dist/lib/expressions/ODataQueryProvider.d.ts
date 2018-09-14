import { ODataResponse } from "../odataResponse";
import { ODataQuery } from "./ODataQuery";
import { Expression } from "./Expression";
export declare abstract class ODataQueryProvider {
    createQuery<T>(expression: Expression): ODataQuery<T>;
    abstract executeQueryAsync<T extends ODataResponse>(expression?: Expression): Promise<T>;
    abstract buildQuery(expression?: Expression): any;
}
