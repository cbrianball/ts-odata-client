import type { ODataQueryProvider } from "./ODataQueryProvider";
import { Expression } from "./Expression";
import type { ExcludeProperties } from "./ExcludeProperties";
import type { ODataV4Options } from "./ODataV4QueryProvider";
import { ODataV4QueryProvider } from "./ODataV4QueryProvider";
import { ODataQueryBase } from "./ODataQueryBase";
import { ExpressionOperator } from "./ExpressionOperator";
import type { ODataQueryResponse, ODataQueryResponseWithCount, ODataResponse } from "./ODataResponse";
import { resolveQuery, type ReplaceDateWithString } from "./ProxyFilterTypes";

/**
 * Represents a query against an OData source.
 * This query is agnostic of the version of OData supported by the server (the provided @type {ODataQueryProvider} is responsible for translating the query into the correct syntax for the desired OData version supported by the endpoint).
 */
export class ODataQuery<T, U = ExcludeProperties<T, []>> extends ODataQueryBase<T, U> {
  static forV4<T>(endpoint: string, options?: Partial<ODataV4Options>) {
    return new ODataQuery<T>(new ODataV4QueryProvider(endpoint, options));
  }

  constructor(
    public readonly provider: ODataQueryProvider,
    public readonly expression?: Expression,
  ) {
    super(provider, expression);
  }

  /**
   * Returns a single record with the provided key value. Some functions (such as top, skip, filter, etc.) are ignored when this function is invoked.
   * @param key
   */
  public async getAsync(key: unknown) {
    const expression = new Expression(ExpressionOperator.GetByKey, [key], this.expression);
    const result = await this.provider.executeQueryAsync<ODataResponse & ReplaceDateWithString<U>>(expression);
    const selectMap = getSelectMap(expression);
    if (selectMap == null) return result;

    const newResult = selectMap(result) as unknown as ODataResponse & ReplaceDateWithString<U>;
    newResult["@odata.context"] = result["@odata.context"];
    return newResult;
  }

  /**
   * Returns a set of records.
   */
  public async getManyAsync() {
    const results = await this.provider.executeQueryAsync<ODataQueryResponse<ReplaceDateWithString<U>>>(
      this.expression,
    );
    handleODataQueryResults(this.provider, this.expression, results);
    return results;
  }

  /**
   * Returns a set of records, including the total count of records, which may not be the same as the number of records return if the results are paginated.
   */
  public async getManyWithCountAsync() {
    const expression = new Expression(ExpressionOperator.GetWithCount, [], this.expression);
    const results =
      await this.provider.executeQueryAsync<ODataQueryResponseWithCount<ReplaceDateWithString<U>>>(expression);
    handleODataQueryResults(this.provider, this.expression, results);

    return results;
  }

  public async getValueAsync() {
    const expression = new Expression(ExpressionOperator.Value, [], this.expression);
    return await this.provider.executeRequestAsync(expression).then((r) => r.blob());
  }

  [resolveQuery]() {
    return this.provider.buildQuery(this.expression);
  }

  // enables usage of for await ... of operator
  [Symbol.asyncIterator]() {
    return odataAsyncIterator(this);
  }
}

async function* odataAsyncIterator<T, U>(query: ODataQuery<T, U>) {
  let results = await query.getManyAsync();
  do {
    yield* results.value;
    if (results.next == null) return undefined;
    results = await results.next();
  } while (true);
}

function getSelectMap<T, U>(expression?: Expression): ((entity: T) => U) | undefined {
  while (expression != null) {
    if (expression.operator === ExpressionOperator.Select) {
      const firstOperand = expression.operands[0];
      return typeof firstOperand === "function" ? (firstOperand as (entity: T) => U) : undefined;
    }
    expression = expression.previous;
  }
  return;
}

function handleODataQueryResults<T>(
  provider: ODataQueryProvider,
  expression: Expression | undefined,
  result: ODataQueryResponse<T>,
) {
  if (expression != null) applySelectMapIfExists(expression, result);
  if (result["@odata.nextLink"] != null) {
    result.next = async () => {
      const nextPageResult = (await provider.executeQueryAsync(
        result["@odata.nextLink"] as string,
      )) as ODataQueryResponse<T>;
      handleODataQueryResults(provider, expression, nextPageResult);
      return nextPageResult;
    };
  }
}

function applySelectMapIfExists<T>(expression: Expression, results: ODataQueryResponse<T>) {
  const mapper = getSelectMap<T, T>(expression);
  if (mapper == null) return results;
  results.value = results.value.map(mapper);
  return results;
}
