import { Literal } from "./Literal";
import { ExpressionOperator } from "./ExpressionOperator";

/**
 * Provides a way of expression operations that can be evaluated at run-time
 */
export class Expression {
    constructor(public operator: ExpressionOperator, public operands: unknown[], public previous?: Expression) { }

    /**
     * Helper method to create a literal value with an optional type provided.
     * @param value The literal value.
     * @param literalType The type of the literal value (may be different than the runtime type given).
     */
    static literal<T>(value: T, literalType: string = typeof value) {
        return new TypedExpression(ExpressionOperator.Literal, [new Literal(value, literalType)]);
    }
}

/**
 * An @type {Expression} that indicates the type of the result. Primarily used for providing type checking for TypeScript.
 */
export class TypedExpression extends Expression { }