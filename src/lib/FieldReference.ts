/**
 * Represnets a reference to a field (instead of a literal value).
 */
export class FieldReference<T> {
    constructor(public field: Extract<keyof T, string>) { }
    public toString() { return this.field; }
}