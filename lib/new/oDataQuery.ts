import { ODataQueryProvider, Expression, FieldReference } from "./oDataQueryProvider";
import { ODataQueryResponse, ODataQueryResponseWithCount, ODataResponse } from "../odataResponse";

type FieldsFor<T> = Extract<keyof T, string>;

export class ODataQuery<T> {
    /**
     *
     */
    constructor(public readonly provider: ODataQueryProvider, public readonly expression: Expression) { }

    /**
     * Limits the fields that are returned; the most recent call to select() will be used.
     * @param fields
     */
    public select<U extends FieldsFor<T>>(...fields: U[]) {
        const expression = new Expression('select', fields.map(v => new FieldReference<T>(v)), this.expression);
        return this.provider.createQuery<Pick<T, U>>(expression);
    }

    /**
     * Returns the top n records; the most recent call to top() will be used.
     * @param n
     */
    public top(n: number) {
        const expression = new Expression('top', [n], this.expression);
        return this.provider.createQuery<T>(expression);
    }

    /**
     * Omits the first n records from appear in the returned records; the most recent call to skip() will be used.
     * @param n
     */
    public skip(n: number) {
        const expression = new Expression('skip', [n], this.expression);
        return this.provider.createQuery<T>(expression);
    }

    /**
     * Determines the sort order (ascending) of the records; calls or orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    public orderBy(...fields: Array<FieldsFor<T>>) {
        const expression = new Expression('orderBy', fields, this.expression);
        return this.provider.createQuery<T>(expression);
    }

    /**
     * Determines the sort order (descending) of the records; calls to orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    public orderByDescending(...fields: Array<FieldsFor<T>>) {
        const expression = new Expression('orderByDescending', fields, this.expression);
        return this.provider.createQuery<T>(expression);
    }

    //TODO: FILTER

    /**
     * Returns a single record with the provided key value. Some functions (such as top, skip, filter, etc.) are ignored when this function is invoked.
     * @param key
     */
    public async getAsync(key: any) {
        const expression = new Expression('getByKey', [key], this.expression);
        return await this.provider.executeQueryAsync<ODataResponse & T>(expression);
    }

    /**
     * Returns a set of records.
     */
    public async getManyAsync() {
        return await this.provider.executeQueryAsync<ODataQueryResponse<T>>(this.expression);
    }

    /**
     * Returns a set of records, including the total count of records, which may not be the same as the number of records return if the results are paginated.
     */
    public async getManyWithCountAsync() {
        const expression = new Expression('getWithCount', [], this.expression);
        return await this.provider.executeQueryAsync<ODataQueryResponseWithCount<T>>(expression);
    }

    public toString() {
        return this.provider.generateQuery(this.expression);
    }
}