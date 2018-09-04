export class ODataContext {
    constructor(private readonly basePath: string, private readonly requestHeaders?: () => RequestInit) { }

    private createProvider(endpointFragment: string) {
        return new ODataProvider({ baseUrl: this.basePath + endpointFragment, headersCallback: this.requestHeaders });
    }

    /**
     * Create and ODataEndpoint by combining the basePath with the provided path.
     * @param path The path, relative to the basePath, of the endpoint
     */
    public createQuery<T>(path: string) {
        return new ODataEndpoint<T, T>(this.createProvider(path));
    }

    /**
     * Retrieves the next page of records based on the @odata.nextLink value provided.
     * @param results
     */
    public async getNextPageAsync<_, T extends ODataQueryResponse<_>>(results: T) {        
        if (!results["@odata.nextLink"]) return undefined;

        return await executeAsync(results["@odata.nextLink"] as string, this.requestHeaders ? this.requestHeaders() : {}) as T;
    }
}

export class FilterBuilder<T, U>{
    public static for<T, U>(query: ODataEndpoint<T, U>): FilterBuilder<T, U> { return new FilterBuilder<T, U>([]); }

    private constructor(private readonly filterClause: string[]) { }

    private transformValue(value: any) {
        switch (typeof value) {
            case "string":
                return `'${value}'`;
            case "number":
            case "boolean":
                return value.toString();
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
                throw new Error(`Unhandled primitive type: ${value}`);
        }

        if (value === null)
            return "null";
        if (value instanceof Date)
            return value.toISOString();
        if (value instanceof String)
            return value.toString();

        throw new Error(`object type with constructor '${(value as Object).constructor.name}' not supported`);
    }

    private conjunctionBuilder(conjunction: 'and' | 'or', predicate: FilterBuilder<T, U>) {
        if (this.filterClause.length === 0)
            throw new Error(`Cannot use '${conjunction}()' as the first call to FilterBuilder`);                
        if (!predicate || !predicate.filterClause || predicate.filterClause.length <= 0)
            throw new Error(`Result of '${conjunction}()' must have at least one filter`);

        let clauses = predicate.filterClause;

        if (clauses.length > 1)
            clauses = [` ${conjunction}(`, ...clauses, ')'];
        else
            clauses = [` ${conjunction} `, ...clauses];

        return new FilterBuilder<T, U>([...this.filterClause, ...clauses]);
    }

    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public and(predicate: FilterBuilder<T, U>) {
        return this.conjunctionBuilder('and', predicate);
    }

    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public or(predicate: FilterBuilder<T, U>) {
        return this.conjunctionBuilder('or', predicate);
    }

    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public not(predicate: FilterBuilder<T, U>) {
        if (!predicate || !predicate.filterClause || predicate.filterClause.length <= 0)
            throw new Error(`Result of 'not' must have at least one filter`);

        let clauses = predicate.filterClause;

        if (clauses.length > 1)
            clauses = [`not(`, ...clauses, ')'];
        else
            clauses = [`not `, ...clauses];

        return new FilterBuilder<T, U>([...this.filterClause, ...clauses]);
    }

    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    public fieldReference<K extends keyof T>(field: K): T[K] {
        //returning String object instead of primitive so it will not be enclosed in quotes when the URL is calculated
        //'tricking' TypeScript into believing the return type is correct
        //at runtime, this will always return a String, but should only be consumed by other methods in this class
        return new String(field) as any;
    }

    /**
     * value will not be enclosed in quotes when the URL is calculated
     * @param value
     */
    public guidLiteral(value: string) {
        return new String(value) as string;
    }

    /**
     * Returns a value that will be the date-only portion of the value provided (e.g., 1970-01-01)
     * @param value
     */
    public dateLiteral(value: string | number | Date): Date {
        if(value instanceof Date) return value;
        return new String(new Date(value).toISOString().substring(0, 10)) as any;
    }

    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    public equals<K extends keyof T>(field: K, value: T[K]) {        
        return new FilterBuilder<T, U>([...this.filterClause, `${field} eq ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    public notEquals<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClause, `${field} ne ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    public greaterThan<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClause, `${field} gt ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    public lessThan<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClause, `${field} lt ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    public greaterThanOrEqualTo<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClause, `${field} ge ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    public lessThanOrEqualTo<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClause, `${field} le ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    public contains<K extends keyof SubType<T, string>>(field: K, value: string) {        
        return new FilterBuilder<T, U>([...this.filterClause, `contains(${field},${this.transformValue(value)})`]);
    }

    public startswith<K extends keyof SubType<T, string>>(field: K, value: string) {
        return new FilterBuilder<T, U>([...this.filterClause, `startswith(${field},${this.transformValue(value)})`]);
    }

    public endswith<K extends keyof SubType<T, string>>(field: K, value: string) {
        return new FilterBuilder<T, U>([...this.filterClause, `endswith(${field},${this.transformValue(value)})`]);
    }

    public toString() {
        return this.filterClause.join('');
    }
}

class ODataEndpoint<T, U>{
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

        return new ODataEndpoint<T, U>(this.provider.createQuery({ filter: predicate.toString() }));
    }

    /**
     * Filters the records with a predicate that is not supported by FilterBuilder; calls to filter() and customFilter() are cumulative (as well as UNIONed (AND)).
     * Consider implementing in FilterBuilder instead of using this function if the functionality can be reused.
     * @param predicate An unescaped URL query string fragment.
     */
    public customFilter(predicate: string) {
        return new ODataEndpoint<T, U>(this.provider.createQuery({ filter: predicate }));
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

class ODataProvider {
    static get emptyClauses() {
        return {
            count: false,
            key: null,
            select: [],
            top: 0,
            skip: 0,
            orderBy: [],
            filter: ""
        } as QueryClauses;
    }

    constructor(private remoteInformation: { baseUrl: string, headersCallback?: () => RequestInit }, private readonly queryClauses: QueryClauses = ODataProvider.emptyClauses) {
        if (!remoteInformation || !remoteInformation.baseUrl)
            throw Error('remoteInformation.baseUrl is required');

        this.queryClauses = this.queryClauses || ODataProvider.emptyClauses;
    }

    public createQuery<T, U>(clauses: Partial<QueryClauses>) {
        const newClauses = { ...ODataProvider.emptyClauses, ...clauses };
        return new ODataProvider(this.remoteInformation, this.mergeQueryClauses(this.queryClauses, newClauses));
    }

    public async executeAsync() {
        let requestInit: RequestInit = {};

        if (typeof this.remoteInformation.headersCallback === "function")
            requestInit = this.remoteInformation.headersCallback();

        return await executeAsync(this.toString(), requestInit);
    }

    private mergeQueryClauses(previous: QueryClauses, next: QueryClauses) {
        return {
            count: next.count || previous.count,
            key: next.key || previous.key,
            filter: (previous.filter && next.filter) ? this.groupFilterClauseIfNeeded(previous.filter.trim()) + ' and ' + this.groupFilterClauseIfNeeded(next.filter.trim()) : (next.filter || previous.filter),
            orderBy: [...previous.orderBy, ...next.orderBy],
            select: next.select.length > 0 ? next.select : previous.select,
            skip: next.skip || previous.skip,
            top: next.top || previous.top,
        } as QueryClauses;
    }

    private groupFilterClauseIfNeeded(filterClause: string) {
        if (!filterClause) return;        

        //look for "and" or "or" with a space on either side to determine if this is a filter with multiple criteria
        const result = / and | or /i.test(filterClause);

        if (result) return `(${filterClause})`;
        return filterClause;
    }

    public toString() {
        const queryString = [];
        
        if (!this.queryClauses.key && this.queryClauses.filter)
            queryString.push(`$filter=${this.queryClauses.filter}`);

        if (!this.queryClauses.key && this.queryClauses.orderBy.length > 0)
            queryString.push(`$orderby=${this.queryClauses.orderBy.join(',')}`);

        if (this.queryClauses.select.length > 0)
            queryString.push(`$select=${this.queryClauses.select.join(',')}`);

        if (!this.queryClauses.key && this.queryClauses.top) queryString.push(`$top=${this.queryClauses.top}`);

        if (!this.queryClauses.key && this.queryClauses.skip) queryString.push(`$skip=${this.queryClauses.skip}`);

        if (!this.queryClauses.key && this.queryClauses.count) queryString.push('$count=true');

        let value = this.remoteInformation.baseUrl;

        if (this.queryClauses.key) value += `(${this.queryClauses.key})`;

        if (queryString.length > 0)
            value += '?' + queryString.join('&');

        return value;
    }    
}

async function executeAsync(url: string, requestInit: RequestInit) {
    const response = await fetch(url, requestInit);

    if (!response.ok)
        throw Error(`Server Error\r\n Status: ${response.status}\r\n Status Text: ${response.statusText}`);

    return await response.json();
}
