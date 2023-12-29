import { TypedExpressionVisitor } from "./TypedExpressionVisitor";
import { FieldReference } from "./FieldReference";
import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
import { Expression } from "./Expression";
import { Literal } from "./Literal";
import { ExpressionOperator } from "./ExpressionOperator";
import { ODataType } from "./ODataType";

type Sort = { field: string, sort?: 'desc' };

export interface ODataV4QuerySegments {
    select?: string[];
    orderBy?: Sort[];
    skip?: number;
    top?: number;
    filter?: string;
    key?: unknown;
    count?: boolean;
    expand?: string[];
    value?: boolean;
}

/**
 * Converts a version-agnistic @type {Expression} into an object that holds information that adheres to ODataV4 speifications.
 */
export class ODataV4ExpressionVisitor extends TypedExpressionVisitor {

    public readonly oDataQuery: ODataV4QuerySegments = {}

    selectVisitor(...fields: [FieldReference<unknown>, ...FieldReference<unknown>[]]) {
        this.oDataQuery.select = fields
            .filter(v => typeof v !== "function")
            .map(f => f.toString());
    }

    orderByVisitor(...fields: FieldReference<unknown>[]) {
        if (!this.oDataQuery.orderBy) this.oDataQuery.orderBy = [];
        this.oDataQuery.orderBy.push(...fields.map(f => ({ field: f.toString() })));
    }

    orderByDescendingVisitor(...fields: FieldReference<unknown>[]) {
        if (!this.oDataQuery.orderBy) this.oDataQuery.orderBy = [];
        this.oDataQuery.orderBy.push(...fields.map<Sort>(f => ({ field: f.toString(), sort: 'desc' })));
    }

    skipVisitor(value: number) {
        this.oDataQuery.skip = value;
    }

    topVisitor(value: number) {
        this.oDataQuery.top = value;
    }

    expandVisitor(...fields: FieldReference<unknown>[]) {
        if (!this.oDataQuery.expand ||
            this.oDataQuery.expand.some(v => v === "*"))
            this.oDataQuery.expand = [];

        this.oDataQuery.expand.push(...fields.map(f => f.toString()));

        //ensure unique values
        this.oDataQuery.expand = Array.from(new Set(this.oDataQuery.expand));
    }

    expandAllVisitor() {
        this.oDataQuery.expand = ["*"];
    }

    getWithCountVisitor() {
        this.oDataQuery.count = true;
    }

    getByKeyVisitor(key: unknown) {
        if (key instanceof Expression) {
            if (key.operator !== ExpressionOperator.Literal)
                throw new Error(`Only literal expressions allowed for ${ExpressionOperator.Literal} expession types`);

            key = key.operands[0];
        }

        if (!(key instanceof Literal))
            key = new Literal(key);

        this.oDataQuery.key = this.deriveLiteral(key as Literal);
    }

    valueVisitor() {
        this.oDataQuery.value = true;
    }

    predicateVisitor(predicate: BooleanPredicateBuilder<unknown>) {
        if (!predicate.expression) return;

        if (predicate.expression.previous)
            throw new Error(`Filter Expressions cannot have a value for 'previous', only operands`);

        let filter = this.translatePredicateExpression(predicate.expression);

        if (this.oDataQuery.filter && filter.length > 1) {
            filter = ['(', ...filter, ')'];
        }

        if (!this.oDataQuery.filter)
            this.oDataQuery.filter = "";

        this.oDataQuery.filter += filter.join(' ');
    }

    private translatePredicateExpression(expression: Expression): string[] {
        const translation: string[][] = [];
        for (const operand of expression.operands) {
            if (operand instanceof Literal) {
                translation.push([this.deriveLiteral(operand)]);
            }
            else if (operand instanceof FieldReference) {
                translation.push([operand.toString()]);
            }
            else if (operand instanceof Expression) {
                translation.push(this.translatePredicateExpression(operand));
            }
            else if (operand instanceof Array) {
                translation.push([operand.map(i => this.deriveLiteral(new Literal(i))).join(',')]);
            }
            else //assume this is a literal without the type specified
                translation.push([this.deriveLiteral(new Literal(operand))]);
        }

        if (translation.length === 1) {
            switch (expression.operator) {
                case ExpressionOperator.Not:
                    return ['not ' + this.reduceTranslatedExpression(translation[0])];
                default:
                    throw new Error(`Operator '${expression.operator}' is not supported`);
            }

        }
        else if (translation.length === 2) {
            const [left, right] = translation;

            switch (expression.operator) {
                case ExpressionOperator.And:
                    return [this.reduceTranslatedExpression(left), 'and', this.reduceTranslatedExpression(right)];
                case ExpressionOperator.Or:
                    return [this.reduceTranslatedExpression(left), 'or', this.reduceTranslatedExpression(right)];
                case ExpressionOperator.Equals:
                    return [`${this.reduceTranslatedExpression(left)} eq ${this.reduceTranslatedExpression(right)}`];
                case ExpressionOperator.GreaterThan:
                    return [`${this.reduceTranslatedExpression(left)} gt ${this.reduceTranslatedExpression(right)}`];
                case ExpressionOperator.GreaterThanOrEqualTo:
                    return [`${this.reduceTranslatedExpression(left)} ge ${this.reduceTranslatedExpression(right)}`];
                case ExpressionOperator.LessThan:
                    return [`${this.reduceTranslatedExpression(left)} lt ${this.reduceTranslatedExpression(right)}`];
                case ExpressionOperator.LessThanOrEqualTo:
                    return [`${this.reduceTranslatedExpression(left)} le ${this.reduceTranslatedExpression(right)}`];
                case ExpressionOperator.NotEquals:
                    return [`${this.reduceTranslatedExpression(left)} ne ${this.reduceTranslatedExpression(right)}`];
                case ExpressionOperator.Contains:
                    return [`contains(${this.reduceTranslatedExpression(left)},${this.reduceTranslatedExpression(right)})`];
                case ExpressionOperator.StartsWith:
                    return [`startsWith(${this.reduceTranslatedExpression(left)},${this.reduceTranslatedExpression(right)})`];
                case ExpressionOperator.EndsWith:
                    return [`endsWith(${this.reduceTranslatedExpression(left)},${this.reduceTranslatedExpression(right)})`];
                case ExpressionOperator.In:
                    return [`${this.reduceTranslatedExpression(left)} in (${this.reduceTranslatedExpression(right)})`];
                default:
                    throw new Error(`Operator '${expression.operator}' is not supported`);
            }
        }
        else if (translation.length === 3) {
            const [left, center, right] = translation;
            switch (expression.operator) {
                case ExpressionOperator.Any:
                    return [`${this.reduceTranslatedExpression(left)}/any(${center}: ${this.reduceTranslatedExpression(right)})`];
                case ExpressionOperator.All:
                    return [`${this.reduceTranslatedExpression(left)}/all(${center}: ${this.reduceTranslatedExpression(right)})`];
                default:
                    throw new Error(`Operator '${expression.operator}' is not supported`);
            }
        }

        throw new Error(`Operator '${expression.operator}' is not supported`);

    }

    private reduceTranslatedExpression(value: string[]) {
        if (value.length === 0) return "";

        if (value.length === 1)
            return `${value[0]}`;

        return `(${value.join(' ')})`;
    }

    private deriveLiteral(literal: Literal): string {
        const value = literal.value;

        switch (literal.literalType) {
            case ODataType.Date:
                return new Date(value as string).toISOString().substring(0, 10);
            case ODataType.Guid:
                return (value as string).toString();
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

        return value.toString();
    }
}