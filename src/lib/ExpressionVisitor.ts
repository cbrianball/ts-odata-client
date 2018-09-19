import { Expression } from "./Expression";

/**
 * Interface used by any type that translates an Expression into a Domain Specific Language (DSL).
 */
export interface ExpressionVisitor {
    visit(expression: Expression): void;
}

