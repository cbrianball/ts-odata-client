import { ExpressionVisitor } from "./expressionVisitor";
export declare class TypedExpressionVisitor implements ExpressionVisitor {
    visit(operator: string, operands: any[]): void;
}
