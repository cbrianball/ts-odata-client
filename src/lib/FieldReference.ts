import { FieldsFor } from "./types";

/**
 * Represnets a reference to a field (instead of a literal value).
 */
export class FieldReference<T> {
    constructor(public field: FieldsFor<T>) { }
    public toString() { return this.field; }
}