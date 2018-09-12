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

    filterVisitor(predicate: BooleanPredicateBuilder<any>) {
        if (!predicate.expression) return;
        
        if (predicate.expression.previous)
            throw new Error(`Filter Expressions cannot have a value for 'previous', only operands`);

        this.oDataQuery.filter = this.translatePredicateExpression(predicate.expression);
    }

    private translatePredicateExpression(expression: Expression) {
        let translation = "";
        for (const operand of expression.operands) {
            if (operand instanceof Literal) { }
            else if (operand instanceof Expression) { }
        }

        return translation;
    }
}