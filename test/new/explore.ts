import { PredicateBuilder } from "../../lib/expressions/PredicateBuilder";
import { Expression } from "../../lib/expressions/Expression";

interface User{firstName: string, lastName: string, age: number, weight: number};

let f: PredicateBuilder<User> = new PredicateBuilder();

f.equals("firstName", "abc").or(f.lessThanOrEqualTo("age", f.fieldReference("weight")));