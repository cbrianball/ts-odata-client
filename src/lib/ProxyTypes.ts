import type { ProxyFilterMethods } from "./ProxyFilterTypes";

export const propertyPath = Symbol();
export const lambdaVariable = Symbol();
export const proxyProperties = Symbol();

type QueryableFieldsFor<T> =
    T extends number ? Exclude<keyof T, keyof number> :
    T extends string ? Exclude<keyof T, keyof string> :
    T extends Date ? Exclude<keyof T, keyof Date> :
    T extends Array<any> ? Exclude<keyof T, keyof Array<any>> :
    T extends Object ? Exclude<keyof T, keyof Object> :
    keyof T & string;

export type EntityProxy<T, IncludeFilterMethods = false> = {
    [P in QueryableFieldsFor<T>]: PropertyProxy<T[P], IncludeFilterMethods> & (IncludeFilterMethods extends true ? ProxyFilterMethods<T[P]> : {});
} & {
    [lambdaVariable]: string;
    [proxyProperties]: PropertyProxy<any>[];
};

export type PropertyProxy<T, IncludeFilterMethods = false> = EntityProxy<T, IncludeFilterMethods>
& {[propertyPath]: string[]};



