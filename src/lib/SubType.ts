/**From T Pick set of properties that extend TK */
export type SubType<T, TK> = Pick<T, {
    [K in keyof T]: T[K] extends TK ? K : never
}[keyof T]>;