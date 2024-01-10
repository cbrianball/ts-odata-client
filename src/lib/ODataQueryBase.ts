import type { ODataQueryProvider } from "./ODataQueryProvider";
import { FieldReference } from "./FieldReference";
import { Expression } from "./Expression";
import type { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { ExpressionOperator } from "./ExpressionOperator";
import type { ExcludeProperties } from "./ExcludeProperties";
import { FilterAccessoryFunctions } from "./FilterAccessoryFunctions";
import type { ProjectorType } from "./ProxyFilterTypes";
import { createProxiedEntity } from "./ProxyFilterTypes";
import type { EntityProxy, PropertyProxy } from "./ProxyTypes";
import { propertyPath, proxyProperties } from "./ProxyTypes";
import type { FieldsFor } from "./FieldsForType";
import type { JsonPrimitiveValueTypes } from "./JsonPrimitiveTypes";

/**
 * Represents a query against an OData source.
 * This query is agnostic of the version of OData supported by the server (the provided @type {ODataQueryProvider} is responsible for translating the query into the correct syntax for the desired OData version supported by the endpoint).
 */
export class ODataQueryBase<T, U = ExcludeProperties<T, unknown[]>> {
  constructor(
    public readonly provider: ODataQueryProvider,
    public readonly expression?: Expression,
  ) {}

  /**
   * Limits the fields that are returned; the most recent call to select() will be used.
   * @param fields
   */
  public select<U extends FieldsFor<T>>(...fields: U[]): ODataQueryBase<T, U>;
  public select<U extends ProjectorType>(projector: (proxy: T) => U): ODataQueryBase<T, U>;
  public select<U>(...args: [(proxy: T) => U | FieldsFor<T>, ...FieldsFor<T>[]]) {
    if (args.length === 0) throw new Error("Parameters are requird");

    const firstArg = args[0];
    if (typeof firstArg === "function") {
      const proxy = this.provider[createProxiedEntity]();
      firstArg(proxy as unknown as T);
      const expression = new Expression(
        ExpressionOperator.Select,
        [firstArg, ...getUsedPropertyPaths(proxy)],
        this.expression,
      );
      return this.provider.createQuery<T, U>(expression);
    }

    const expression = new Expression(
      ExpressionOperator.Select,
      (args as FieldsFor<T>[]).map((v) => new FieldReference<T>(v)),
      this.expression,
    );
    return this.provider.createQuery<T, U>(expression);
  }

  /**
   * Returns the top n records; the most recent call to top() will be used.
   * @param n
   */
  public top(n: number) {
    const expression = new Expression(ExpressionOperator.Top, [n], this.expression);
    return this.provider.createQuery<T, U>(expression);
  }

  /**
   * Omits the first n records from appear in the returned records; the most recent call to skip() will be used.
   * @param n
   */
  public skip(n: number) {
    const expression = new Expression(ExpressionOperator.Skip, [n], this.expression);
    return this.provider.createQuery<T, U>(expression);
  }

  /**
   * Determines the sort order (ascending) of the records; calls or orderBy() and orderByDescending() are cumulative.
   * @param fields
   */
  public orderBy(fields: (entity: EntityProxy<T>) => PropertyProxy<unknown> | Array<PropertyProxy<unknown>>) {
    const proxy = this.provider[createProxiedEntity]<T>();
    const properties = [fields(proxy)].flat();
    const expression = new Expression(
      ExpressionOperator.OrderBy,
      properties.map((f) => new FieldReference(f[propertyPath].join("/") as unknown as FieldsFor<unknown>)),
      this.expression,
    );
    return this.provider.createQuery<T, U>(expression);
  }

  /**
   * Determines the sort order (descending) of the records; calls to orderBy() and orderByDescending() are cumulative.
   * @param fields
   */
  public orderByDescending(fields: (entity: EntityProxy<T>) => PropertyProxy<unknown> | Array<PropertyProxy<unknown>>) {
    const proxy = this.provider[createProxiedEntity]<T>();
    const properties = [fields(proxy)].flat();
    const expression = new Expression(
      ExpressionOperator.OrderByDescending,
      properties.map((f) => new FieldReference(f[propertyPath].join("/") as unknown as FieldsFor<unknown>)),
      this.expression,
    );
    return this.provider.createQuery<T, U>(expression);
  }

  /**
   * Filters the records based on the provided expression; multiple calls to filter() are cumulative (as well as UNIONed (AND))
   * @param predicate A function that takes in an entity proxy and returns a BooleanPredicateBuilder.
   */
  public filter(
    predicate:
      | BooleanPredicateBuilder<T>
      | ((builder: EntityProxy<T, true>, functions: FilterAccessoryFunctions<T>) => BooleanPredicateBuilder<T>),
  ) {
    if (typeof predicate === "function")
      predicate = predicate(
        this.provider[createProxiedEntity]() as unknown as EntityProxy<T, true>,
        new FilterAccessoryFunctions<T>(),
      );

    const expression = new Expression(ExpressionOperator.Predicate, [predicate], this.expression);
    return this.provider.createQuery<T, U>(expression);
  }

  /**
   * Includes the indicated arrays are to be returned as part of the query results.
   * @param fields
   */
  public expand<
    K extends keyof ExcludeProperties<
      T,
      JsonPrimitiveValueTypes | ArrayLike<JsonPrimitiveValueTypes> | Date | ArrayLike<Date>
    >,
  >(...fields: K[]) {
    const expression = new Expression(
      ExpressionOperator.Expand,
      fields.map((f) => new FieldReference<T>(f as unknown as FieldsFor<T>)),
      this.expression,
    );
    return this.provider.createQuery<T, U & Pick<T, K>>(expression);
  }

  /**
   * Includes all arrays as part of the query results.
   * @param fields
   */
  public expandAll() {
    const expression = new Expression(ExpressionOperator.ExpandAll, [], this.expression);
    return this.provider.createQuery<T, U>(expression);
  }

  build(){
    return this.provider.build(this.expression);
  }
}

/**
 * Function that returns all OData paths that were used by the proxy.
 * @param projectTarget
 * @returns An array of paths found within the object (if the same path is used more than once, the duplicates are removed)
 */
function getUsedPropertyPaths(proxy: EntityProxy<unknown>): string[] {
  const paths: string[] = [];
  for (const p of proxy[proxyProperties]) {
    if (p[proxyProperties].length === 0) paths.push(p[propertyPath].join("/"));
    else paths.push(...getUsedPropertyPaths(p));
  }

  return Array.from(new Set(paths.flat()));
}
