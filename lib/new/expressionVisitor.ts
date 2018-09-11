export abstract class ExpressionVisitor {

    abstract visit(operator: string, operands: any[]): void;
}

