import { ODataQueryProvider, Expression } from "./oDataQueryProvider";
import { ODataResponse } from "../odataResponse";

export class ODataV4QueryProvider extends ODataQueryProvider {
    executeQueryAsync<T extends ODataResponse>(expression: Expression): T {
        throw new Error("Method not implemented.");
    }

    toString() {
        return "";
    }

}