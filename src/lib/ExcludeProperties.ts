/**From T Exclude set of properties that extend TK */
export type ExcludeProperty<T, TK> = Pick<T, {
    [K in keyof T]: T[K] extends TK ? never : K
}[keyof T]>;