import type { ODataQueryProvider } from "./ODataQueryProvider";
import type { Expression } from "./Expression";
import type { ExcludeProperties } from "./ExcludeProperties";
import type { ODataV4Options } from "./ODataV4QueryProvider";
import { ODataV4QueryProvider } from "./ODataV4QueryProvider";
import { ODataQueryBase } from "./ODataQueryBase";

/**
 * Represents a query against an OData source.
 * This query is agnostic of the version of OData supported by the server (the provided @type {ODataQueryProvider} is responsible for translating the query into the correct syntax for the desired OData version supported by the endpoint).
 */
export class ODataQuery<T, U = ExcludeProperties<T, unknown[]>> extends ODataQueryBase<T, U> {
  static forV4<T>(endpoint: string, options?: Partial<ODataV4Options>) {
    return new ODataQuery<T>(new ODataV4QueryProvider(endpoint, options));
  }

  constructor(
    public readonly provider: ODataQueryProvider,
    public readonly expression?: Expression,
  ) {
    super(provider, expression);
  }
}
