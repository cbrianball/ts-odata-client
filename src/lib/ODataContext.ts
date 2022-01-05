import { ODataQuery } from "./ODataQuery";
import type { ExcludeProperties } from "./ExcludeProperties";

/**
 * Base ODataContext class; expected to implement specific versions of OData.
 */
export abstract class ODataContext {
    constructor(protected basePath: string) { }

    /**
     * Creates an @type {ODataQuery} instance used to query the provided endpoint.
     * @param endpoint The path, relative to the basePath provided to the contructor.
     */
    protected abstract createQuery<T, U = ExcludeProperties<T, any[]>>(endpoint: string): ODataQuery<T, U>;
}