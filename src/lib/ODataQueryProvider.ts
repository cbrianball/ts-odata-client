import { ODataResponse } from "./ODataResponse";
import { ODataQuery } from "./ODataQuery";
import { Expression } from "./Expression";
import { EntityProxy, lambdaSymbol, propertyPathSymbol, PropertyProxy, ProxyFieldPredicate } from "./ProxyFilter";
import { FieldReference } from "./FieldReference";

export const createProxiedEntity = Symbol();

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
     * Executes the provided @type {Expression}.
     * @param expression 
     */
    abstract executeQueryAsync<T extends ODataResponse>(expression?: Expression): Promise<T>;

    /**
     * Returns the value that represents the query that will be executed.
     * @param expression 
     */
    abstract buildQuery(expression?: Expression): any;

    private lambdaProxyCounter = 0;
    [createProxiedEntity]<T>(isLambdaProxy = false): EntityProxy<T> {
        const lambdaVariable = isLambdaProxy ? `p${this.lambdaProxyCounter++}` : '';
        return new Proxy({ [lambdaSymbol]: lambdaVariable }, {
            get: (instance: any, property: string | Symbol) => {
                if (typeof property === "symbol") return instance[lambdaSymbol];

                const path = [property as string];
                if (isLambdaProxy) {
                    path.unshift(lambdaVariable);
                }
                return this.createPropertyProxy(path);
            }
        });
    }

    private createPropertyProxy<T>(navigationPath: string[]): PropertyProxy<T> {
        if (navigationPath.length === 0) throw new Error('PropertyProxy must be initialized with at least one proprety path');
        const target = { [propertyPathSymbol]: navigationPath };
        const predicate = new ProxyFieldPredicate<T>(target as PropertyProxy<T>);
        return new Proxy(target, {
            get: (target: any, property: string | symbol) => {
                if(typeof property === "symbol") {
                    return target[property];
                }
                
                if ((property).startsWith("$")) {                    
                    return ((predicate as unknown as any)[property.slice(1)] as Function).bind(predicate);
                }
                return this.createPropertyProxy([...navigationPath, property]);
            }
        });
    }
}