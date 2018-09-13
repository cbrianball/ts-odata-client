import { TypedExpressionVisitor } from "./TypedExpressionVisitor";
import { FieldReference } from "./FieldReference";
import { BooleanPredicateBuilder } from "./BooleanPredicateBuilder";
declare type Sort = {
    field: string;
    sort?: 'desc';
};
interface ODataQuery {
    select?: string[];
    orderBy?: Sort[];
    skip?: number;
    top?: number;
    filter: string;
}
export declare class ODataV4ExpressionVisitor extends TypedExpressionVisitor {
    readonly oDataQuery: ODataQuery;
    selectVisitor(...fields: FieldReference<any>[]): void;
    orderByVisitor(...fields: FieldReference<any>[]): void;
    orderByDescendingVisitor(...fields: FieldReference<any>[]): void;
    skipVisitor(value: number): void;
    topVisitor(value: number): void;
    predicateVisitor(predicate: BooleanPredicateBuilder<any>): void;
    private translatePredicateExpression;
    private reduceTranslatedExpression;
    private deriveLiteral;
}
export {};
