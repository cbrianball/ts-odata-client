import { ExpressionVisitor } from "./ExpressionVisitor";
import { Expression } from "./Expression";

/**
 * Evaluates Expression by calling methods on type that follow the pattern of '[operator]Visitor'.
 * The operands are passed in as parameters.
 */
export abstract class TypedExpressionVisitor implements ExpressionVisitor {
    visit(expression: Expression): void {
        if (!expression) throw new Error(`'expression' is a required parameter.`);

        if (expression.previous)
            this.visit(expression.previous);

        const member = (this as any)[expression.operator + "Visitor"];

        if (typeof member !== "function")
            throw new Error(`No method found named '${expression.operator}Visitor'; '${expression.operator}' operator is not supported.`);

        member.apply(this, expression.operands);
    }
}