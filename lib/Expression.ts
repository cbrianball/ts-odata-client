import { Literal } from "./Literal";
import { FieldReference } from "./FieldReference";

export class Expression {
    constructor(public operator: string, public operands: any[], public previous?: Expression) { }    

    static literal<T>(value: T, literalType: string = typeof value) {
        return new TypedExpression<T>('literal', [new Literal(value, literalType)]);
     }     
}

export class TypedExpression<T> extends Expression { }