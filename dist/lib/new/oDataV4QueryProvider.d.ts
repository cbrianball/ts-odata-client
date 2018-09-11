import { ODataQueryProvider } from "./oDataQueryProvider";
import { Expression } from "./expression";
import { ODataResponse } from "../odataResponse";
export declare class ODataV4QueryProvider extends ODataQueryProvider {
    executeQueryAsync<T extends ODataResponse>(expression: Expression): T;
    deriveValue(queryValue: any): string;
}
