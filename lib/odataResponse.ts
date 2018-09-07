export interface ODataResponse {
    ["@odata.context"]: string;
}

export interface ODataQueryResponse<T> extends ODataResponse {
    ["@odata.nextLink"]?: string;
    value: T[];
}

export interface ODataQueryResponseWithCount<T> extends ODataQueryResponse<T> {
    ["@odata.count"]?: number;
}