import { ODataResponse } from "../odataResponse";
import { ODataQuery } from "./ODataQuery";
import { Expression } from "./Expression";

export abstract class ODataQueryProvider {
    createQuery<T>(expression: Expression) {
        return new ODataQuery<T>(this, expression);
    }

    abstract executeQueryAsync<T extends ODataResponse>(expression?: Expression): Promise<T>;
    abstract buildQuery(expression? : Expression): any;
}