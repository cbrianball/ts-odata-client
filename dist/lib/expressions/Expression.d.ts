export declare class Expression {
    operator: string;
    operands: any[];
    previous?: Expression | undefined;
    constructor(operator: string, operands: any[], previous?: Expression | undefined);
    static literal<T>(value: T, literalType?: string): TypedExpression<T>;
}
export declare class TypedExpression<T> extends Expression {
}
