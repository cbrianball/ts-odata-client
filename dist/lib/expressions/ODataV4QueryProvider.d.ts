import { ODataQueryProvider } from "./ODataQueryProvider";
import { Expression } from "./Expression";
import { ODataResponse } from "../odataResponse";
export declare class ODataV4QueryProvider extends ODataQueryProvider {
    executeQueryAsync<T extends ODataResponse>(expression: Expression): T;
    deriveValue(queryValue: any): string;
}
