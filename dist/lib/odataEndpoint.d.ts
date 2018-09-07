import { FilterBuilder } from "./filterBuilder";
import { ODataProvider } from "./odataProvider";
import { ODataResponse, ODataQueryResponse, ODataQueryResponseWithCount } from "./odataResponse";
export declare class ODataEndpoint<T, U> {
    private readonly provider;
    constructor(provider: ODataProvider);
    /**
     * Limits the fields that are returned; the most recent call to select() will be used.
     * @param fields
     */
    select<K extends Extract<keyof U, string>>(...fields: K[]): ODataEndpoint<T, Pick<U, K>>;
    /**
     * Returns the top n records; the most recent call to top() will be used.
     * @param n
     */
    top(n: number): ODataEndpoint<T, U>;
    /**
     * Omits the first n records from appear in the returned records; the most recent call to skip() will be used.
     * @param n
     */
    skip(n: number): ODataEndpoint<T, U>;
    /**
     * Determines the sort order (ascending) of the records; calls or orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    orderBy(...fields: Array<Extract<keyof T, string>>): ODataEndpoint<T, U>;
    /**
     * Determines the sort order (descending) of the records; calls to orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    orderByDescending(...fields: Array<keyof U>): ODataEndpoint<T, U>;
    /**
     * Filters the records based on the resulting FilterBuilder; calls to filter() and customFilter() are cumulative (as well as UNIONed (AND))
     * @param predicate Either an existing FilterBuilder, or a function that takes in an empty FilterBuilder and returns a FilterBuilder instance.
     */
    filter(predicate: FilterBuilder<T, U> | ((builder: FilterBuilder<T, U>) => FilterBuilder<T, U>)): ODataEndpoint<T, U>;
    /**
     * Filters the records with a predicate that is not supported by FilterBuilder; calls to filter() and customFilter() are cumulative (as well as UNIONed (AND)).
     * Consider implementing in FilterBuilder instead of using this function if the functionality can be reused.
     * @param predicate An unescaped URL query string fragment.
     */
    customFilter(predicate: string): ODataEndpoint<T, U>;
    /**
     * Returns a single record with the provided key value. Some functions (such as top, skip, filter, etc.) are ignored when this function is invoked.
     * @param key
     */
    getAsync(key: any): Promise<U & ODataResponse>;
    /**
     * Returns a set of records.
     */
    getManyAsync(): Promise<ODataQueryResponse<U>>;
    /**
     * Returns a set of records, including the total count of records, which may not be the same as the number of records return if the results are paginated.
     */
    getManyWithCountAsync(): Promise<ODataQueryResponseWithCount<U>>;
}
