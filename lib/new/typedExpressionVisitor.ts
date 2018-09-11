import { ExpressionVisitor } from "./expressionVisitor";

export class TypedExpressionVisitor implements ExpressionVisitor {
    visit(operator: string, operands: any[]): void {
        const member = (this as any)[operator + "Visitor"];
        if (typeof member === "function") {
            member.apply(this, operands);
        }
        else {
            throw new Error(`No method found named '${operator}Visitor'; operator is not supported.`);
        }
    }
}