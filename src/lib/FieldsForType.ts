/**
 * Returns all fields within type T that are strings (e.g., not symbols or numbers)
 */
export type FieldsFor<T> = string & keyof T;