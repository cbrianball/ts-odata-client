import { ODataQueryProvider } from "./ODataQueryProvider";
import { FieldReference } from "./FieldReference";
import { Expression } from "./Expression";
import { ODataQueryResponse, ODataQueryResponseWithCount, ODataResponse } from "./ODataResponse";
import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { ExpressionOperator } from "./ExpressionOperator";
import { SubType } from "./SubType";
import { ExcludeProperties } from "./ExcludeProperties";
import { ODataV4QueryProvider, ODataV4Options } from "./ODataV4QueryProvider";
import { FilterAccessoryFunctions } from "./FilterAccessoryFunctions";
import { createProxiedEntity, resolveQuery, ReplaceDateWithString, ProjectorType } from "./ProxyFilterTypes";
import { EntityProxy, PropertyProxy, propertyPath, proxyProperties } from "./ProxyTypes";
import { FieldsFor } from "./FieldsForType";
import type { JsonPrimitiveValueTypes } from "./JsonPrimitiveTypes";

/**
 * Represents a query against an OData source.
 * This query is agnostic of the version of OData supported by the server (the provided @type {ODataQueryProvider} is responsible for translating the query into the correct syntax for the desired OData version supported by the endpoint).
 */
export class ODataQuery<T, U = ExcludeProperties<T, any[]>> {

    static forV4<T>(endpoint: string, options?: Partial<ODataV4Options>) {
        return new ODataQuery<T>(new ODataV4QueryProvider(endpoint, options));
    }

    constructor(public readonly provider: ODataQueryProvider, public readonly expression?: Expression) { }

    /**
     * Limits the fields that are returned; the most recent call to select() will be used.
     * @param fields
     */
    public select<U extends FieldsFor<T>>(...fields: U[]): ODataQuery<T, U>;
    public select<U extends ProjectorType>(projector: (proxy: T) => U): ODataQuery<T, U>;
    public select<U>(...args: [(proxy: T) => U | FieldsFor<T>, ...FieldsFor<T>[]]) {
        if (args.length === 0) throw new Error('Parameters are requird');

        const firstArg = args[0];
        if (typeof firstArg === "function") {
            const proxy = this.provider[createProxiedEntity]();
            firstArg(proxy as unknown as T);
            const expression = new Expression(ExpressionOperator.Select, [firstArg, ...getUsedPropertyPaths(proxy)], this.expression);
            return this.provider.createQuery<T, U>(expression);
        }

        const expression = new Expression(ExpressionOperator.Select, (args as FieldsFor<T>[]).map(v => new FieldReference<T>(v)), this.expression);
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
        const properties = [fields(proxy)].flat()
        const expression = new Expression(ExpressionOperator.OrderBy,
            properties.map(f => new FieldReference(f[propertyPath].join('/') as unknown as FieldsFor<unknown>)),
            this.expression);
        return this.provider.createQuery<T, U>(expression);
    }

    /**
     * Determines the sort order (descending) of the records; calls to orderBy() and orderByDescending() are cumulative.
     * @param fields
     */
    public orderByDescending(fields: (entity: EntityProxy<T>) => PropertyProxy<unknown> | Array<PropertyProxy<unknown>>) {
        const proxy = this.provider[createProxiedEntity]<T>();
        const properties = [fields(proxy)].flat()
        const expression = new Expression(ExpressionOperator.OrderByDescending,
            properties.map((f => new FieldReference(f[propertyPath].join('/') as unknown as FieldsFor<unknown>))),
            this.expression);
        return this.provider.createQuery<T, U>(expression);
    }

    /**
     * Filters the records based on the provided expression; multiple calls to filter() are cumulative (as well as UNIONed (AND))
     * @param predicate A function that takes in an entity proxy and returns a BooleanPredicateBuilder.
     */
    public filter(predicate: BooleanPredicateBuilder<T> | ((builder: EntityProxy<T, true>, functions: FilterAccessoryFunctions<T>) => BooleanPredicateBuilder<T>)) {
        if (typeof predicate === "function")
            predicate = predicate(this.provider[createProxiedEntity]() as unknown as EntityProxy<T, true>, new FilterAccessoryFunctions<T>());

        const expression = new Expression(ExpressionOperator.Predicate, [predicate], this.expression);
        return this.provider.createQuery<T, U>(expression);
    }

    /**
     * Includes the indicated arrays are to be returned as part of the query results.
     * @param fields 
     */
    public expand<K extends keyof ExcludeProperties<T, JsonPrimitiveValueTypes | ArrayLike<JsonPrimitiveValueTypes> | Date | ArrayLike<Date>>>(...fields: K[]) {
        const expression = new Expression(ExpressionOperator.Expand, fields.map(f => new FieldReference<T>(<any>f)), this.expression);
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

    /**
     * Returns a single record with the provided key value. Some functions (such as top, skip, filter, etc.) are ignored when this function is invoked.
     * @param key
     */
    public async getAsync(key: any) {
        const expression = new Expression(ExpressionOperator.GetByKey, [key], this.expression);
        // return await this.provider.executeQueryAsync<ODataResponse & ReplaceDateWithString<U>>(expression);
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
        const results = await this.provider.executeQueryAsync<ODataQueryResponse<ReplaceDateWithString<U>>>(this.expression);
        const selectMap = getSelectMap(this.expression);
        if (selectMap != null) {
            results.value = results.value.map(selectMap) as unknown as ReplaceDateWithString<U>[];
        }
        return results;
    }

    /**
     * Returns a set of records, including the total count of records, which may not be the same as the number of records return if the results are paginated.
     */
    public async getManyWithCountAsync() {
        const expression = new Expression(ExpressionOperator.GetWithCount, [], this.expression);
        const results = await this.provider.executeQueryAsync<ODataQueryResponseWithCount<ReplaceDateWithString<U>>>(expression);
        const selectMap = getSelectMap(expression);
        if (selectMap != null) {
            results.value = results.value.map(selectMap) as unknown as ReplaceDateWithString<U>[];
        }
        return results;
    }

    public async getValueAsync() {
        const expression = new Expression(ExpressionOperator.Value, [], this.expression);
        return await this.provider.executeRequestAsync(expression)
            .then(r => r.blob());

    }

    [resolveQuery]() {
        return this.provider.buildQuery(this.expression);
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
        if (p[proxyProperties].length === 0) paths.push(p[propertyPath].join('/'));
        else paths.push(...getUsedPropertyPaths(p));
    }

    return Array.from(new Set(paths.flat()));
}

function getSelectMap<T, U>(expression?: Expression): ((entity: T) => U) | undefined {
    while (expression != null) {
        if (expression.operator === ExpressionOperator.Select) {
            const firstOperand = expression.operands[0];
            return (typeof firstOperand === "function") ? firstOperand : undefined;
        }
        expression = expression.previous;
    }
    return;
}