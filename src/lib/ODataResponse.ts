/**
 * Represents an OData response with a single entity.
 */
export interface ODataResponse {
    /**
     * Type information about the result(s) returned.
     */
    ["@odata.context"]: string;
}

/**
 * Represents an OData response with 0 or more results.
 */
export interface ODataQueryResponse<T> extends ODataResponse {
    /**
     * If server-side paging is implemented, this will hold the complete URL of the query used to retrieve the next 'page' of results.
     */
    ["@odata.nextLink"]?: string;

    /**
     * The results of the OData query
     */
    value: T[];
}

/**
 * Represnets an OData response with 0 or more results that should also include the total number of items in the results.
 * This value will be different than the number of items in @member {value} if server-side paging is implemented.
 */
export interface ODataQueryResponseWithCount<T> extends ODataQueryResponse<T> {
    ["@odata.count"]?: number;
}