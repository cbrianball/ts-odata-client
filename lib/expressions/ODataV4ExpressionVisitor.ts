import { TypedExpressionVisitor } from "./TypedExpressionVisitor";
import { FieldReference } from "./FieldReference";
import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { Expression } from "./Expression";
import { Literal } from "./literal";

type Sort = { field: string, sort?: 'desc' };

interface ODataQuery {
    select?: string[];
    orderBy?: Sort[];
    skip?: number;
    top?: number;
    filter?: string;
}

export class ODataV4ExpressionVisitor extends TypedExpressionVisitor {

    public readonly oDataQuery: ODataQuery = {        
    }

    selectVisitor(...fields: FieldReference<any>[]) {
        this.oDataQuery.select = fields.map(f => f.toString());
    }

    orderByVisitor(...fields: FieldReference<any>[]) {
        if(!this.oDataQuery.orderBy) this.oDataQuery.orderBy = [];
        this.oDataQuery.orderBy.push(...fields.map(f => ({ field: f.toString() })));
    }

    orderByDescendingVisitor(...fields: FieldReference<any>[]) {
        if(!this.oDataQuery.orderBy) this.oDataQuery.orderBy = [];
        this.oDataQuery.orderBy.push(...fields.map<Sort>(f => ({ field: f.toString(), sort: 'desc' })));
    }

    skipVisitor(value: number) {
        this.oDataQuery.skip = value;
    }

    topVisitor(value: number) {
        this.oDataQuery.top = value;
    }

    predicateVisitor(predicate: BooleanPredicateBuilder<any>) {
        if (!predicate.expression) return;
        
        if (predicate.expression.previous)
            throw new Error(`Filter Expressions cannot have a value for 'previous', only operands`);

        /*this.oDataQuery.filter =*/ this.translatePredicateExpression(predicate.expression);
    }

    private translatePredicateExpression(expression: Expression): string[] {
        let translation: string[][] = [];
        for (const operand of expression.operands) {
            if (operand instanceof Literal) {
                translation.push([this.deriveLiteral(operand)]);
             }
             else if (operand instanceof FieldReference){
                translation.push([operand.toString()]);
             }
            else if (operand instanceof Expression) {
                translation.push(this.translatePredicateExpression(operand));
            }
        }
        
        if(translation.length === 1) {
            const [operand] = translation;
            if(expression.operator === ExpressionOperator.Not) {
                if(operand.length > 1) {
                    return [`not(${operand.join(' ')})`];
                }
                else
                    return [`not ${operand[0]}`];
            }        
        }
        else if(translation.length === 2){

        }

        throw new Error('Not fully implemented');        
    }

    private deriveLiteral(literal: Literal): string {
        const value = literal.value;

        switch(literal.literalType) {
            case ODataType.Date:
            return new Date(value).toISOString().substring(0, 10);            
            case ODataType.Guid:
            return value.toString();            
        }
        
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

        return value.toString();
    }
}