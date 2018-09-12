import { ODataQueryProvider } from "./ODataQueryProvider";
import { Literal } from "./Literal";
import { FieldReference } from "./FieldReference";
import { Expression } from "./Expression";
import { ODataResponse } from "../odataResponse";

export class ODataV4QueryProvider extends ODataQueryProvider {
    executeQueryAsync<T extends ODataResponse>(expression: Expression): T {
        throw new Error("Method not implemented.");
    }

    deriveValue(queryValue: any): string {

        if(queryValue instanceof Literal) {
            switch(queryValue.literalType) {
                case "guid":
                    return queryValue.value;
                case "date":
                    let dateValue: Date = queryValue.value;
                    if(dateValue instanceof Date === false)
                        dateValue = new Date(queryValue.value);
                    return dateValue.toISOString().substring(0, 10);                
                default: throw new Error(`Literal '${queryValue.literalType}' not supported by QueryProvider`);
            }
        }

        if(queryValue instanceof FieldReference) {
            return queryValue.toString();
        }

        switch (typeof queryValue) {
            case "string":
                return `'${queryValue}'`;
            case "number":
            case "boolean":
                return queryValue.toString();
            case "undefined":
                return 'null';
            case "function":
                throw new Error("function not supported");
            case "symbol":
                throw new Error("symbol not supported");
            case "object":
                //objects handled below
                break;
            default:
                throw new Error(`Unhandled primitive type: ${queryValue}`);
        }

        if (queryValue === null)
            return "null";
        if (queryValue instanceof Date)
            return queryValue.toISOString();
        if (queryValue instanceof String)
            return queryValue.toString();

        return queryValue.toString();
    }
}