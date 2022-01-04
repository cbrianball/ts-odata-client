import { ODataV4QueryProvider, ODataV4Options } from "./ODataV4QueryProvider";
import { ODataContext } from "./ODataContext";
import { ExcludeProperties } from "./ExcludeProperties";

/**
 * Base ODataContext class; use this class as a base for communicating with services that are compatible with OData v4.
 * This context uses the fetch library; if the runtime environment does not support fetch, please use a polyfill.
 */
export abstract class ODataV4Context extends ODataContext {
    constructor(basePath: string, protected options?: Partial<ODataV4Options>) {
        super(basePath);
    }

    protected createQuery<T, U = ExcludeProperties<T, any[]>>(endpoint: string) {
        return new ODataV4QueryProvider(this.basePath + endpoint, this.options).createQuery<T, U>();
    }
}