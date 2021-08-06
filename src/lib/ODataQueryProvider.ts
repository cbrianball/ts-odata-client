import { ODataResponse } from "./ODataResponse";
import { ODataQuery } from "./ODataQuery";
import { Expression } from "./Expression";

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
}