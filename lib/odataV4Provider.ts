export class ODataV4Provider {

}

let f: ODataEntitySetQuery<{firstName: string, lastName: string}>;

f.select('firstName', 'lastName').orderBy("lastName");



interface ODataProviderz {
    createEntitySet<T>(): ODataEntitySetQuery<T>;
    createFunction<T>(): ODataEntitySetQuery<T>;
    createAction<T>(): ODataEntitySetQuery<T>;
}



interface ODataEntitySetQuery<T> {
    top(n: number): ODataEntitySetQuery<T>;
    skip(n: number): ODataEntitySetQuery<T>;    
    select<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntitySetQuery<Pick<T,K>>;
    orderBy<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntitySetQuery<T>;
    orderByDescending<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntitySetQuery<T>;
}

interface ODataEntityQuery<T> {
    select<K extends Extract<keyof T, string>>(...fields: K[]) : ODataEntityQuery<Pick<T,K>>;
}