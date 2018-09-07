import { FilterBuilder } from "./filterBuilder";
import { ODataProvider } from "./odataProvider";

import { ODataResponse, ODataQueryResponse, ODataQueryResponseWithCount } from "./odataResponse";

export class ODataEndpoint<T, U>{
    constructor(private readonly provider: ODataProvider) { }

    /**
     * Limits the fields that are returned; the most recent call to select() will be used.
     * @param fields
     */
    public select<K extends Extract<keyof U, string>>(...fields: K[]) {
        return new ODataEndpoint<T, Pick<U, K>>(this.provider.createQuery({ select: fields }));
    }

    /**
     * Returns the top n records; the most recent call to top() will be used.
     * @param n
     */
    public top(n: number) {
        return new ODataEndpoint<T, U>(this.provider.createQuery({ top: n }));
    }

    /**
     * Omits the first n records from appear in the returned records; the most recent call to skip() will be used.
     * @param n
     */
    public skip(n: number) {
        return new ODataEndpoint<T, U>(this.provider.createQuery({ skip: n }));
    }

    /**
     * Determines the sort order (ascending) of the records; calls or orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    public orderBy(...fields: Array<Extract<keyof T, string>>) {
        return new ODataEndpoint<T, U>(this.provider.createQuery({ orderBy: fields }));
    }

    /**
     * Determines the sort order (descending) of the records; calls to orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    public orderByDescending(...fields: Array<keyof U>) {
        return new ODataEndpoint<T, U>(this.provider.createQuery({ orderBy: fields.map(f => f + ' desc') }));
    }

    /**
     * Filters the records based on the resulting FilterBuilder; calls to filter() and customFilter() are cumulative (as well as UNIONed (AND))
     * @param predicate Either an existing FilterBuilder, or a function that takes in an empty FilterBuilder and returns a FilterBuilder instance.
     */
    public filter(predicate: FilterBuilder<T, U> | ((builder: FilterBuilder<T, U>) => FilterBuilder<T, U>)) {
        if (typeof predicate === "function")
            predicate = predicate(FilterBuilder.for(this));

        return new ODataEndpoint<T, U>(this.provider.createQuery({ filter: predicate.filterClauses }));
    }

    /**
     * Filters the records with a predicate that is not supported by FilterBuilder; calls to filter() and customFilter() are cumulative (as well as UNIONed (AND)).
     * Consider implementing in FilterBuilder instead of using this function if the functionality can be reused.
     * @param predicate An unescaped URL query string fragment.
     */
    public customFilter(predicate: string) {
        return new ODataEndpoint<T, U>(this.provider.createQuery({ filter: [predicate] }));
    }

    /**
     * Returns a single record with the provided key value. Some functions (such as top, skip, filter, etc.) are ignored when this function is invoked.
     * @param key
     */
    public async getAsync(key: any) {
        return await this.provider.createQuery({ key: key }).executeAsync() as U & ODataResponse;
    }

    /**
     * Returns a set of records.
     */
    public async getManyAsync() {
        return await this.provider.executeAsync() as ODataQueryResponse<U>;
    }

    /**
     * Returns a set of records, including the total count of records, which may not be the same as the number of records return if the results are paginated.
     */
    public async getManyWithCountAsync() {
        return await this.provider.createQuery({ count: true }).executeAsync() as ODataQueryResponseWithCount<U>;
    }

}