/**
 * From T Pick set of properties that extend TK
 * Example: SubType<{name: string, age: number}, number> will result in the type {age: number}
 * */
export type SubType<T, TK> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends TK ? K : never;
  }[keyof T]
>;
