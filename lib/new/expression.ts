export class Expression {
    constructor(public operator: string, public operands: any[], public previous?: Expression) {
    }
}