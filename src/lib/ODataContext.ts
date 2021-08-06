import { ODataQuery } from "./ODataQuery";

/**
 * Base ODataContext class; expected to implement specific versions of OData.
 */
export abstract class ODataContext {
    constructor(protected basePath: string) { }

    /**
     * Creates an @type {ODataQuery} instance used to query the provided endpoint.
     * @param endpoint The path, relative to the basePath provided to the contructor.
     */
    protected abstract createQuery<T>(endpoint: string): ODataQuery<T>;
}