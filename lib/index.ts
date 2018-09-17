import { ODataV4QueryProvider } from "./ODataV4QueryProvider";
import { ODataQuery } from "./ODataQuery";

export abstract class ODataContext {
    constructor(protected basePath: string) { }

    protected abstract createQuery<T>(endpoint: string): ODataQuery<T>;
}

export abstract class ODataV4Context extends ODataContext {

    constructor(basePath: string, protected requestInit?: () => RequestInit) {
        super(basePath);
    }

    protected createQuery<T>(endpoint: string) {
        return new ODataQuery<T>(new ODataV4QueryProvider(this.basePath + endpoint, this.requestInit));
    }
}