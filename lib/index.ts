import {ODataEndpoint} from "./odata-endpoint";

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