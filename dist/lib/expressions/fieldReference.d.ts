export declare class FieldReference<T> {
    field: Extract<keyof T, string>;
    constructor(field: Extract<keyof T, string>);
    toString(): Extract<keyof T, string>;
}
