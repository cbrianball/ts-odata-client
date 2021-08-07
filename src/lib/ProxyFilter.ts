import { SubType } from "./SubType";

// goal for ProxyFilter:
// query<User>.filter(u => u.firstName.startsWith('efg'))
// query<User>filter((u,compound) => compound.and(u.firstName.equals('John'), compound.or(u.lastName.endsWith('th'), u.age.lessThan(60))))
// slightly cleaner with destructuring
// quer<User>filter((u, {and, or}) => and(u.firstName.equals('John'), or(u.lastName.endsWith('th'), u.age.lessThan(60))))

interface User {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    dob: Date;
}

interface StringFilterProxy {
    equals(value: string): any;
    startsWith(value: string): any;
    endsWith(value: string): any;
    contains(value: string): any;
}

interface NumberFilterProxy {
    equals(value: number): any;
    greaterThan(value: number): any;
    lessThan(value: number): any;
}

type FieldsFor<T> = Extract<keyof T, string>;

type ProxyFilter<T> {
    [P in FieldsFor<SubType<T, number>>]: NumberFilterProxy; 
} &
{
    [P in FieldsFor<SubType<T, string>>]: StringFilterProxy; 
}

const a: ProxyFilter<User> = {} as unknown as any;
