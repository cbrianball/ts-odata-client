import { ODataResponse } from "./ODataResponse";
import { ODataQuery } from "./ODataQuery";
import { Expression } from "./Expression";
import { ProxyPropertyPredicate } from "./ProxyPropertyPredicate";
import { createProxiedEntity } from "./ProxyFilterTypes";
import { lambdaVariable, proxyProperties, propertyPath, EntityProxy, PropertyProxy } from "./ProxyTypes";

/**
 * Base type used by all @type {ODataQueryProvider} implementations.
 */
export abstract class ODataQueryProvider {
  /**
   * Creates a new @type {ODataQuery} using the current provider.
   * @param expression The @type {Expression} the query will be based on.
   */
  createQuery<T, U>(expression?: Expression) {
    return new ODataQuery<T, U>(this, expression);
  }

  /**
   * Executes the provided @type {Expression} and returns the results as a JSON object.
   * @param expression
   */
  abstract executeQueryAsync<T extends ODataResponse>(expression?: Expression): Promise<T>;

  /**
   * Executed the provided @type {Expression} and returns the raw response.
   * @param expression
   */
  abstract executeRequestAsync(expression?: Expression): Promise<Response>;

  /**
   * Returns the value that represents the query that will be executed.
   * @param expression
   */
  abstract buildQuery(expression?: Expression): unknown;

  private lambdaProxyCounter = 0;
  [createProxiedEntity]<T>(isLambdaProxy = false): EntityProxy<T> {
    const lambdaVariableName = isLambdaProxy ? `p${this.lambdaProxyCounter++}` : "";
    return new Proxy(
      { [lambdaVariable]: lambdaVariableName, [proxyProperties]: new Array<PropertyProxy<unknown>>() },
      {
        get: (instance, property) => {
          if (typeof property === "symbol") {
            switch (property) {
              case lambdaVariable:
                return instance[lambdaVariable];
              case proxyProperties:
                return instance[proxyProperties];
              default:
                throw new Error("Unkonwn symbol");
            }
          }
          const path = [property as string];
          if (isLambdaProxy) {
            path.unshift(lambdaVariableName);
          }
          const proxyProperty = this.createPropertyProxy(path);
          instance[proxyProperties].push(proxyProperty);
          return proxyProperty;
        },
      },
    ) as unknown as EntityProxy<T>;
  }

  private createPropertyProxy<T>(navigationPath: string[]): PropertyProxy<T> {
    if (navigationPath.length === 0)
      throw new Error("PropertyProxy must be initialized with at least one proprety path");
    const target = { [propertyPath]: navigationPath, [proxyProperties]: new Array<PropertyProxy<unknown>>() };
    const predicate = new ProxyPropertyPredicate<T>(target as unknown as PropertyProxy<T>, this);
    return new Proxy(target, {
      get: (target, property) => {
        if (typeof property === "symbol") {
          switch (property) {
            case propertyPath:
              return target[propertyPath];
            case proxyProperties:
              return target[proxyProperties];
            default:
              throw new Error("Unknown symbol");
          }
        }

        if (property.startsWith("$")) {
          return (predicate as unknown as Record<string, () => unknown>)[property.slice(1)].bind(predicate);
        }
        const propertyProxy = this.createPropertyProxy([...navigationPath, property]);
        target[proxyProperties].push(propertyProxy);
        return propertyProxy;
      },
    }) as unknown as PropertyProxy<T>;
  }
}
