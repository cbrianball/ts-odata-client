export declare class Expression {
    operator: string;
    operands: any[];
    previous?: Expression | undefined;
    constructor(operator: string, operands: any[], previous?: Expression | undefined);
}
