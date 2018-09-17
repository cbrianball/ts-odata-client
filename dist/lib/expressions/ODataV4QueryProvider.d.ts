import { ODataQueryProvider } from "./ODataQueryProvider";
import { Expression } from "./Expression";
import { ODataResponse } from "./ODataResponse";
export declare class ODataV4QueryProvider extends ODataQueryProvider {
    private readonly basePath;
    private readonly requestInit?;
    constructor(basePath: string, requestInit?: (() => RequestInit) | undefined);
    executeQueryAsync<T extends ODataResponse>(expression?: Expression): Promise<T>;
    buildQuery(expression?: Expression): string;
    private generateUrl;
}
