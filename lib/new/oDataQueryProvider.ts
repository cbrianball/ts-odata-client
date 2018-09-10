import { ODataQuery } from "./oDataQuery";
import { ODataResponse } from "../odataResponse";

export abstract class ODataQueryProvider {
    createQuery<T>(expression: Expression) {
        return new ODataQuery<T>(this, expression);
    }

    abstract executeQueryAsync<T extends ODataResponse>(expression: Expression): T;

    generateQuery(expression: Expression) {
        const query = this.buildQuery(expression, {});
        return this.buildODataQuery(query);
    }

    protected transformExpression(expression: Expression, query: Query) {
        switch (expression.operator) {
            case "select":
                query.select = expression.operands.map(v => v.toString());
                break;
            case "top":
                query.top = expression.operands[0];
                break;
            case "skip":
                query.skip = expression.operands[0];
                break;
            case "count":
                query.count = "true";
                break;
            case "orderBy":
                query.orderBy = (query.orderBy || []).concat(expression.operands.map((v: string) => ({ field: v })));
                break;
            case "orderByDescending":
                query.orderBy = (query.orderBy || []).concat(expression.operands.map<Sort>((v: string) => ({ field: v, direction: "desc" })));
                break;
            case "key":
                query.key = expression.operands[0].toString();
                break;
            case "filter":
                //TODO: filter
                break;
            default: throw new Error(`Oporator '${expression.operator} is not supported`);
        }

        return query;
    }

    protected buildODataQuery(query: Query) {
        let returnValue = "";
        if ('key' in query) {
            returnValue += `(${query.key.toString()})`;
            delete query.key;
        }


        let fragments: string[] = [];
        for (let value in query) {
            fragments.push(`$${value}=${(query as any)[value].toString()}`);
        }

        if (fragments.length === 0) return returnValue;

        return returnValue + `?${fragments.join("&")}`;
    }

    private buildQuery(expression: Expression, query: Query) {
        if (!query) query = {};
        while (expression.previous) {
            query = this.buildQuery(expression.previous, query);
        }

        return this.transformExpression(expression, query);
    }
}

type Sort = { field: string, direction?: 'desc' };

interface Query {
    select?: string[];
    top?: number | undefined;
    skip?: number | undefined;
    count?: string | undefined;
    orderBy?: Sort[];
    key?: any;
    filter?: any;
}

export class Expression {
    constructor(public operator: string, public operands: any[], public previous: Expression) {
    }
}

export class FieldReference<T> {
    constructor(public field: Extract<keyof T, string>) { }

    public toString() { return this.field; }
}

export class Literal {
    constructor(public literalType: string, public value: any) { }
}