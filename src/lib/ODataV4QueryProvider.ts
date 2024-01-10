import { ODataQueryProvider } from "./ODataQueryProvider";
import type { Expression } from "./Expression";
import type { ODataResponse } from "./ODataResponse";
import type { ODataV4QuerySegments } from "./ODataV4ExpressionVisitor";
import { ODataV4ExpressionVisitor } from "./ODataV4ExpressionVisitor";
import type { ExcludeProperties } from "./ExcludeProperties";

export interface ODataV4Options {
  requestInit: () => RequestInit | Promise<RequestInit>;
}

/**
 * A class used to generate queries that will ultimately be translated into ODataV4 queries.
 * Consumed by ODataContext classes; can also be used directly in lieu of creating an ODataContext class.
 */
export class ODataV4QueryProvider extends ODataQueryProvider {
  constructor(
    private readonly path: string,
    private readonly options?: Partial<ODataV4Options>,
  ) {
    super();
  }

  static createQuery<T>(path: string, options?: Partial<ODataV4Options>) {
    return new ODataV4QueryProvider(path, options).createQuery<T, ExcludeProperties<T, unknown[]>>();
  }

  private async sendRequest(expression?: Expression) {
    const url = this.buildQuery(expression);

    let init = this.options?.requestInit?.() ?? {};
    if (init instanceof Promise) init = await init;

    return await fetch(url, init);
  }

  async executeQueryAsync<T extends ODataResponse>(expression?: Expression) {
    const response = await this.sendRequest(expression);

    if (response.ok) return (await response.json()) as T;

    throw new Error(JSON.stringify(await response.json()));
  }

  async executeRequestAsync(expression?: Expression) {
    const response = await this.sendRequest(expression);

    if (response.ok) return response;

    throw new Error(await response.text());
  }

  buildQuery(expression?: Expression) {
    return expression ? this.generateUrl(expression) : this.path;
  }

  build(expression?: Expression): ODataV4QuerySegments {
    return expression ?  this.prepareExpression(expression).oDataQuerySegments : {};
  }

  private prepareExpression(expression: Expression): {
    oDataQuerySegments: ODataV4QuerySegments;
    path: string;
  } {
    const visitor = new ODataV4ExpressionVisitor();
    visitor.visit(expression);

    let path = this.path;

    if (visitor.oDataQuery.key) path += `(${visitor.oDataQuery.key})`;

    if (visitor.oDataQuery.value === true) {
      path += "/$value";
    }

    return {
      oDataQuerySegments: visitor.oDataQuery,
      path,
    };
  }

  private generateUrl(expression: Expression) {
    const { oDataQuerySegments, path } = this.prepareExpression(expression);
    const queryString = this.buildQueryString(oDataQuerySegments);
    return path + queryString;
  }

  private buildQueryString(query: ODataV4QuerySegments) {
    const queryString: string[] = [];

    if (query.filter) queryString.push(`$filter=${encodeURIComponent(query.filter)}`);

    if (query.orderBy) {
      queryString.push(
        `$orderby=${encodeURIComponent(
          query.orderBy.map((o) => (o.sort ? `${o.field} ${o.sort}` : o.field)).join(","),
        )}`,
      );
    }

    if (query.select) queryString.push(`$select=${encodeURIComponent(query.select.join(","))}`);

    if (query.skip) queryString.push(`$skip=${Math.floor(query.skip)}`);

    if (typeof query.top === "number" && query.top >= 0) queryString.push(`$top=${Math.floor(query.top)}`);

    if (query.count) queryString.push("$count=true");

    if (query.expand) queryString.push(`$expand=${encodeURIComponent(query.expand.join(","))}`);

    if (queryString.length > 0) return "?" + queryString.join("&");
    return "";
  }
}