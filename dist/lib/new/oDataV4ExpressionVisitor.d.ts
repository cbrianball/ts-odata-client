import { TypedExpressionVisitor } from "./typedExpressionVisitor";
import { FieldReference } from "./FieldReference";
declare type Sort = {
    field: string;
    sort?: 'desc';
};
interface ODataQuery {
    select: string[];
    orderBy: Sort[];
}
export declare class ODataV4ExpressionVisitor extends TypedExpressionVisitor {
    readonly oDataQuery: ODataQuery;
    selectVisitor(...fields: FieldReference<any>[]): void;
    orderByVisitor(...fields: FieldReference<any>[]): void;
    orderByDescendingVisitor(...fields: FieldReference<any>[]): void;
}
export {};
