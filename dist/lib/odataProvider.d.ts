export declare class ODataProvider {
    private remoteInformation;
    private readonly queryClauses;
    static readonly emptyClauses: QueryClauses;
    constructor(remoteInformation: {
        baseUrl: string;
        headersCallback?: () => RequestInit;
    }, queryClauses?: QueryClauses);
    createQuery<T, U>(clauses: Partial<QueryClauses>): ODataProvider;
    executeAsync(): Promise<any>;
    private mergeQueryClauses;
    private combineFilterClauses;
    toString(): string;
}
export declare function executeAsync(url: string, requestInit: RequestInit): Promise<any>;
interface QueryClauses {
    count: boolean;
    key: any;
    filter: string[];
    orderBy: string[];
    select: string[];
    skip: number;
    top: number;
}
export {};
