# ts-odata-client

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/cbrianball/ts-odata-client/CI/main?style=plastic)
![npm](https://img.shields.io/npm/v/ts-odata-client?style=plastic)

A library for creating and executing OData queries. Makes heavy use of TypeScript for a better developer experience.

## Prerequisites
This library does not have any dependencies on any other NPM packages, but it does utilize the `fetch` and `Proxy` APIs. A pollyfil can be used for `fetch`, but there is currently no known pollyfil for `Proxy`. Please [go here](https://caniuse.com/?search=Proxy()) to view Browser compatibility for `Proxy`.

## Supported Versions
Only OData version 4 is currently supported by this library.

## Quick Start
If you want to start coding immediately, install the NPM package, then use the following as reference.

```typescript
import { ODataQuery} from 'ts-odata-client';

interface User {id: number; firstName: string; lastName: string; age: number};

const results = await ODataQuery.forV4<User>('http://domain.example/path/to/endpoint' /*, optional function parameter to initialize fetch request */)
  .filter(u => u.firstName.$startsWith('St').and(u.age.$greaterThanOrEqualTo(25))
  .select('firstName', 'lastName')
  .getManyAsync();
  
  console.log(results); // results is the json object that is returned by the OData service
  console.log(results.value); // results.value is of type Array<{firstName: string, lastName: string}>
```

## Using a Data Context
The above is great for one-off queries, but if you have an OData service with mutliple endpoints, and you want to encapsulate that in a single class, then write a class that extends the provided `ODataContextV4` class

```typescript
import { ODataV4Context } from 'ts-odata-client';

interface User {id: number; firstName: string; lastName: string; age: number};

class MyODataContext extends ODataV4Context {
  constructor(baseUrl: string) {
    super(baseUrl /*, optional function parameter to initialize fetch request */);
  }
  
  get users() { return this.createQuery<User>('relative/path/from/baseUrl'); }
}

// create instance and write query
const context = new MyODataContext('https://domain.example/odata/');
const result = await context.users
  .filter(u => u.firstName.$startsWith('St').and(u.age.$greaterThanOrEqualTo(25))
  .select('firstName', 'lastName')
  .getManyAsync();
```

## Executing OData Functions
An OData function that returns a collection from an entity set can be treated just like any other endpoint, but it has the advantage that it can take parameter values

```typescript
function callODataFunction(parameter: string)
// Remember: If the parameter is a string and it has a single quote in it, that will need to be escaped with two single quotes
const query = ODataQuery.forV4<User>(`http://domain.example/path/to/endpoint/function(myParameter='${parameter}')` /*, optional function parameter to initialize fetch request */);
```

`query` can now be used like any other OData Query (e.g., `filter`, `select`, `top`, etc.).



## Upgrading from v1.x to 2.x
2.0 introduces a number of breaking changes. The primary breaking changes are with the `filter`, `orderBy` and `orderByDescending` methods on the `ODataQuery` type.

### filter
  This method still accepts a `BooleanPredicateBuilder<T>` as an argument; however, the method signature alternative has now changed; instead of a `FilterBuilder` object, the provided argument for the method is now an `EntityProxy`. The best way to demonstrate the difference is with an example.
  
  ```typescript
  const userQuery = ...
  
  //v1.x syntax:
  userQuery.filter(f => f.greaterThan('firstName', 'St').and(f.equals('age', 30)));
  
  //v2.x syntax:
  userQuery = filter(u => u.firstName.$greaterThan('St').and(u.age.$equals(30)));
  
  //v2.x alternative conjunction syntax
  userQuery.filter((u, {and}) => and(u.firstName.$greaterThan('St'), u.age.$equals(30));  
  ```
  
  Note: in the last example, the second parameter `{and}` is a destructuring of the `FilterAccessoryFunctions` type, currently supported methods are `and`, `or`, and `not`. While `and` and `or` can be handled without the second argument (e.g., `userQuery = filter(u => u.firstName.$greaterThan('St').and(u.age.$equals(30)));`), the `not` method is only available from the `FilterAccessoryFunctions` type.
  
### orderBy and orderByDescending
  Similar to filter, these methods now take an `EntityProxy` type as the method parameter.
  
  ```typescript
  const userQuery = ...
  
  //v1.x syntax:
  userQuery.orderBy('firstName');
  
  //v2.x syntax:
  userQuery.orderBy(u => u.firstName);
  //to sort on multiple properties
  userQuery.orderBy(u => [u.lastName, u.firstName]);
  ```
