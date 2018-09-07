import { ODataEndpoint } from "./odataEndpoint";
import { ODataQueryResponse } from "./odataResponse";
export declare class ODataContext {
    private readonly basePath;
    private readonly requestHeaders?;
    constructor(basePath: string, requestHeaders?: (() => RequestInit) | undefined);
    private createProvider;
    /**
     * Create and ODataEndpoint by combining the basePath with the provided path.
     * @param path The path, relative to the basePath, of the endpoint
     */
    createQuery<T>(path: string): ODataEndpoint<T, T>;
    /**
     * Retrieves the next page of records based on the @odata.nextLink value provided.
     * @param results
     */
    getNextPageAsync<_, T extends ODataQueryResponse<_>>(results: T): Promise<T | undefined>;
}
