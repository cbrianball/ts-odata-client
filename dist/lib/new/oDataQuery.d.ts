import { ODataQueryProvider } from "./oDataQueryProvider";
import { Expression } from "./expression";
import { ODataQueryResponse, ODataQueryResponseWithCount, ODataResponse } from "../odataResponse";
import { PredicateBuilder } from "./expressionBuilder";
declare type FieldsFor<T> = Extract<keyof T, string>;
export declare class ODataQuery<T> {
    readonly provider: ODataQueryProvider;
    readonly expression: Expression;
    /**
     *
     */
    constructor(provider: ODataQueryProvider, expression: Expression);
    /**
     * Limits the fields that are returned; the most recent call to select() will be used.
     * @param fields
     */
    select<U extends FieldsFor<T>>(...fields: U[]): ODataQuery<Pick<T, U>>;
    /**
     * Returns the top n records; the most recent call to top() will be used.
     * @param n
     */
    top(n: number): ODataQuery<T>;
    /**
     * Omits the first n records from appear in the returned records; the most recent call to skip() will be used.
     * @param n
     */
    skip(n: number): ODataQuery<T>;
    /**
     * Determines the sort order (ascending) of the records; calls or orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    orderBy(...fields: Array<FieldsFor<T>>): ODataQuery<T>;
    /**
     * Determines the sort order (descending) of the records; calls to orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    orderByDescending(...fields: Array<FieldsFor<T>>): ODataQuery<T>;
    /**
     * Filters the records based on the resulting FilterBuilder; calls to filter() and customFilter() are cumulative (as well as UNIONed (AND))
     * @param predicate Either an existing FilterBuilder, or a function that takes in an empty FilterBuilder and returns a FilterBuilder instance.
     */
    filter(predicate: PredicateBuilder<T> | ((builder: PredicateBuilder<T>) => PredicateBuilder<T>)): ODataQuery<{}>;
    /**
     * Returns a single record with the provided key value. Some functions (such as top, skip, filter, etc.) are ignored when this function is invoked.
     * @param key
     */
    getAsync(key: any): Promise<ODataResponse & T>;
    /**
     * Returns a set of records.
     */
    getManyAsync(): Promise<ODataQueryResponse<T>>;
    /**
     * Returns a set of records, including the total count of records, which may not be the same as the number of records return if the results are paginated.
     */
    getManyWithCountAsync(): Promise<ODataQueryResponseWithCount<T>>;
    toString(): string;
}
export {};
