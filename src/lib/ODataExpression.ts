import type { ExcludeProperties } from "./ExcludeProperties";
import { ODataQueryBase } from "./ODataQueryBase";
import { ODataV4QueryProvider } from "./ODataV4QueryProvider";

/**
 * Represents a query expression builder only, with empty endpoiont.
 */

export class ODataExpression<T, U = ExcludeProperties<T, unknown[]>>  {

  oDataQuery: ODataQueryBase<T, U>;

  static forV4<T>() {
    return new ODataExpression<T>().oDataQuery;
  }

  constructor() {
    this.oDataQuery = new ODataQueryBase<T, U>(new ODataV4QueryProvider(''));
  }
  
}
