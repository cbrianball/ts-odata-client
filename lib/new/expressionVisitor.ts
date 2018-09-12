import { Expression } from "./Expression";

/**
 * Interface used by any type that translates an Expression into DSL
 */
export interface ExpressionVisitor {

    visit(expression: Expression): void;
}

