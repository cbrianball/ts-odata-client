import { expect } from "chai";

import { ODataProvider } from "../lib/odataProvider";
import { ODataEndpoint } from "../lib/odataEndpoint";

interface User {
    firstName: string;
    lastName: string;
    age: number;
}

describe("combining conjunction clauses", () => {
    const provider = new ODataProvider({ baseUrl: '/' });
    const endpoint = new ODataEndpoint<User, User>(provider);
});