import { ODataResponse } from "./ODataResponse";
import { ODataQuery } from "./ODataQuery";
import { Expression } from "./Expression";
import { ProxyPropertyPredicate } from "./ProxyPropertyPredicate";
import { createProxiedEntity, lambdaVariable, propertyPath, EntityProxy, PropertyProxy } from "./types";



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
    abstract buildQuery(expression?: Expression): any;

    private lambdaProxyCounter = 0;
    [createProxiedEntity]<T>(isLambdaProxy = false): EntityProxy<T> {
        const lambdaVariableName = isLambdaProxy ? `p${this.lambdaProxyCounter++}` : '';
        return new Proxy({ [lambdaVariable]: lambdaVariableName }, {
            get: (instance: any, property: string | Symbol) => {
                if (typeof property === "symbol") return instance[lambdaVariable];

                const path = [property as string];
                if (isLambdaProxy) {
                    path.unshift(lambdaVariableName);
                }
                return this.createPropertyProxy(path);
            }
        });
    }

    private createPropertyProxy<T>(navigationPath: string[]): PropertyProxy<T> {
        if (navigationPath.length === 0) throw new Error('PropertyProxy must be initialized with at least one proprety path');
        const target = { [propertyPath]: navigationPath };
        const predicate = new ProxyPropertyPredicate<T>(target as unknown as PropertyProxy<T>, this);
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