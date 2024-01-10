import type { Expression } from "./Expression";
import type { ExcludeProperties } from "./ExcludeProperties";
import { ODataQueryBase } from "./ODataQueryBase";
import { ODataV4QueryProvider } from "./ODataV4QueryProvider";

/**
 * Represents a query expression builder only, without any provider.
 */

export class ODataExpression<T, U = ExcludeProperties<T, unknown[]>>  extends ODataQueryBase<T, U>  {
  static forV4<T>() {
    return new ODataExpression<T>();
  }

  constructor(public readonly expression?: Expression) {
    super(new ODataV4QueryProvider(''), expression);
  }
}
