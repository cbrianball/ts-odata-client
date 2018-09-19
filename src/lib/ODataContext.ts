import { ODataQuery } from "./ODataQuery";
/**
 * Base ODataContext class; expected to implement specific versions of OData
 */
export abstract class ODataContext {
    constructor(protected basePath: string) { }
    protected abstract createQuery<T>(endpoint: string): ODataQuery<T>;
}