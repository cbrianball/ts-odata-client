interface ODataQueryResponseWithCount<T> extends ODataQueryResponse<T> {
    ["@odata.count"]?: number;
}
