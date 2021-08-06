/**
 * From T Exclude set of properties that extend TK.
 * Example: Exclude<{name: string, age: number}, number> will result in the type {name: string}
 * */
export type ExcludeProperties<T, TK> = Pick<T, {
    [K in keyof T]: T[K] extends TK ? never : K
}[keyof T]>;