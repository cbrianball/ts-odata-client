import { ExpressionVisitor } from "./ExpressionVisitor";
import { Expression } from "./Expression";
/**
 * Evaluates Expression by calling methods on type that follow the pattern of '[operator]Visitor'.
 * The operands are passed in as parameters.
 */
export declare abstract class TypedExpressionVisitor implements ExpressionVisitor {
    visit(expression: Expression): void;
}
