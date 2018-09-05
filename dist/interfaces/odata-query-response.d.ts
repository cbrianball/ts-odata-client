interface ODataQueryResponse<T> extends ODataResponse {
    ["@odata.nextLink"]?: string;
    value: T[];
}
