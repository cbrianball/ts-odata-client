import { ODataV4QueryProvider } from "./ODataV4QueryProvider";
import { ODataQuery } from "./ODataQuery";

/**
 * Base ODataContext class; expected to implement specific versions of OData
 */
export abstract class ODataContext {
    constructor(protected basePath: string) { }

    protected abstract createQuery<T>(endpoint: string): ODataQuery<T>;
}

/**
 * Base ODataContext class; use this class as a base for communicating with services that are compatible with OData v4
 */
export abstract class ODataV4Context extends ODataContext {

    constructor(basePath: string, protected requestInit?: () => RequestInit) {
        super(basePath);
    }

    protected createQuery<T>(endpoint: string) {
        return new ODataV4QueryProvider(this.basePath + endpoint, this.requestInit).createQuery<T>();
    }
}


export { ODataV4QueryProvider };