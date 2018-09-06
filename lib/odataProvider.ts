export class ODataProvider {
    static get emptyClauses() {
        return {
            count: false,
            key: null,
            select: [],
            top: 0,
            skip: 0,
            orderBy: [],
            filter: []
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
            filter: this.combineFilterClauses(previous.filter, next.filter),
            orderBy: [...previous.orderBy, ...next.orderBy],
            select: next.select.length > 0 ? next.select : previous.select,
            skip: next.skip || previous.skip,
            top: next.top || previous.top,
        } as QueryClauses;
    }

    private combineFilterClauses(left: string[], right: string[]){
        if(!left && !right) return;

        if(!left) return right;
        if(!right) return left;

        const result: string[] = [];

        if(left.length > 1){
            result.push(`(${left.join('')})`);
        }
        else{
            result.push(...left);
        }

        if(right.length > 1){
            result.push(`(${right.join('')})`);
        }
        else{
            result.push(...right);
        }

        return result;
    }    

    public toString() {
        const queryString = [];
        
        if (!this.queryClauses.key && this.queryClauses.filter && this.queryClauses.filter.length > 0)
            queryString.push(`$filter=${this.queryClauses.filter.join(' and ')}`);

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

export async function executeAsync(url: string, requestInit: RequestInit) {
    const response = await fetch(url, requestInit);

    if (!response.ok)
        throw Error(`Server Error\r\n Status: ${response.status}\r\n Status Text: ${response.statusText}`);

    return await response.json();
}

interface QueryClauses {
    count: boolean;
    key: any;
    filter: string[];
    orderBy: string[];
    select: string[];
    skip: number;
    top: number;
}