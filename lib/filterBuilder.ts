import { ODataEndpoint } from "./odataEndpoint";

export class FilterBuilder<T, U>{
    public static for<T, U>(query: ODataEndpoint<T, U>): FilterBuilder<T, U> { return new FilterBuilder<T, U>([]); }

    private constructor(public readonly filterClauses: string[]) { }

    private transformValue(value: any) {
        switch (typeof value) {
            case "string":
                return `'${value}'`;
            case "number":
            case "boolean":
                return value.toString();
            case "undefined":
                return 'null';
            case "function":
                throw new Error("function not supported");
            case "symbol":
                throw new Error("symbol not supported");
            case "object":
                //objects handled below
                break;
            default:
                throw new Error(`Unhandled primitive type: ${value}`);
        }

        if (value === null)
            return "null";
        if (value instanceof Date)
            return value.toISOString();
        if (value instanceof String)
            return value.toString();

        throw new Error(`object type with constructor '${((value as Object).constructor as any).name}' not supported`);
    }

    private conjunctionBuilder(conjunction: 'and' | 'or', predicate: FilterBuilder<T, U>) {
        if (this.filterClauses.length === 0)
            throw new Error(`Cannot use '${conjunction}()' as the first call to FilterBuilder`);                
        if (!predicate || !predicate.filterClauses || predicate.filterClauses.length <= 0)
            throw new Error(`Result of '${conjunction}()' must have at least one filter`);
        
        let clauses = predicate.filterClauses;

        const inverseConjunction = conjunction === 'and' ? 'or' : 'and';

        //if predicate contains a conjunction different than the current one, it needs to be wrapped in ()'s
        if(clauses.some(v => v === inverseConjunction))
            clauses = [`(${clauses.join(' ')})`];

        return new FilterBuilder<T, U>([...this.filterClauses, conjunction, ...clauses]);
    }

    /**
     * Create an AND condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public and(predicate: FilterBuilder<T, U>) {
        return this.conjunctionBuilder('and', predicate);
    }

    /**
     * Create an OR condition with a previous filter clause
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public or(predicate: FilterBuilder<T, U>) {
        return this.conjunctionBuilder('or', predicate);
    }

    /**
     * Negates the result of the predicate provided
     * @param predicate Use the same FilterBuilder that this method chain was invoked with
     */
    public not(predicate: FilterBuilder<T, U>) {
        if (!predicate || !predicate.filterClauses || predicate.filterClauses.length <= 0)
            throw new Error(`Result of 'not' must have at least one filter`);

        let clauses = predicate.filterClauses;

        if (clauses.length > 1)
            clauses = [`not(${clauses.join(' ')})`];            
        else
            clauses = ['not', ...clauses];

        return new FilterBuilder<T, U>([...this.filterClauses, ...clauses]);
    }

    /**
     * Returns a reference used by FilterBuilder to allow comparisons to other values within the record
     * @param field
     */
    public fieldReference<K extends keyof T>(field: K): T[K] {
        //returning String object instead of primitive so it will not be enclosed in quotes when the URL is calculated
        //'tricking' TypeScript into believing the return type is correct
        //at runtime, this will always return a String, but should only be consumed by other methods in this class
        return new String(field) as any;
    }

    /**
     * value will not be enclosed in quotes when the URL is calculated
     * @param value
     */
    public guidLiteral(value: string) {
        return new String(value) as string;
    }

    /**
     * Returns a value that will be the date-only portion of the value provided (e.g., 1970-01-01)
     * @param value
     */
    public dateLiteral(value: string | number | Date): Date {
        if(value instanceof Date) return value;
        return new String(new Date(value).toISOString().substring(0, 10)) as any;
    }

    /**
     * Filters based on equality of a field with the provided value
     * @param field
     * @param value
     */
    public equals<K extends keyof T>(field: K, value: T[K]) {        
        return new FilterBuilder<T, U>([...this.filterClauses, `${field} eq ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field not having the provided value
     * @param field
     * @param value
     */
    public notEquals<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClauses, `${field} ne ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being greater than (>) the provided value
     * @param field
     * @param value
     */
    public greaterThan<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClauses, `${field} gt ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being less than (<) the provided value
     * @param field
     * @param value
     */
    public lessThan<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClauses, `${field} lt ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being greater than or equal to (>=) the provided value
     * @param field
     * @param value
     */
    public greaterThanOrEqualTo<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClauses, `${field} ge ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field being greater than or equal to (<=) the provided value
     * @param field
     * @param value
     */
    public lessThanOrEqualTo<K extends keyof T>(field: K, value: T[K]) {
        return new FilterBuilder<T, U>([...this.filterClauses, `${field} le ${this.transformValue(value)}`]);
    }

    /**
     * Filters based on the field containing the provided value (not case-sensitive)
     * @param field
     * @param value
     */
    public contains<K extends keyof SubType<T, string>>(field: K, value: string) {        
        return new FilterBuilder<T, U>([...this.filterClauses, `contains(${field},${this.transformValue(value)})`]);
    }

    public startswith<K extends keyof SubType<T, string>>(field: K, value: string) {
        return new FilterBuilder<T, U>([...this.filterClauses, `startswith(${field},${this.transformValue(value)})`]);
    }

    public endswith<K extends keyof SubType<T, string>>(field: K, value: string) {
        return new FilterBuilder<T, U>([...this.filterClauses, `endswith(${field},${this.transformValue(value)})`]);
    }

    public toString() {
        return this.filterClauses.join(' ');
    }
}

type SubType<Base, Condition> = Pick<Base, {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}[keyof Base]>;