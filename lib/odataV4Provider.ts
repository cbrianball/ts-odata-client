export interface ODataEntitySetQuery<T> {
    top(n: number): ODataEntitySetQuery<T>;
    skip(n: number): ODataEntitySetQuery<T>;    
    select<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntitySetQuery<Pick<T,K>>;
    orderBy<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntitySetQuery<T>;
    orderByDescending<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntitySetQuery<T>;
}

export interface ODataEntityQuery<T> {
    select<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntityQuery<Pick<T,K>>;
}