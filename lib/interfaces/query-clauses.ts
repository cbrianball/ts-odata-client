interface QueryClauses {
    count: boolean;
    key: any;
    filter: string;
    orderBy: string[];
    select: string[];
    skip: number;
    top: number;
}