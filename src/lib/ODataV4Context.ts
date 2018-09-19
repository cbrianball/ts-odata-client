import { ODataV4QueryProvider } from "./ODataV4QueryProvider";
import { ODataContext } from "./ODataContext";

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