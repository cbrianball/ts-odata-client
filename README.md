# ts-odata-client

![GitHub Workflow Status (branch)](https://img.shields.io/github/actions/workflow/status/cbrianball/ts-odata-client/action-ci.yml?branch=main&style=plastic)
![npm](https://img.shields.io/npm/v/ts-odata-client?style=plastic)

A library for creating and executing OData queries. It makes heavy use of TypeScript for a better developer experience.

## Installation
```console
npm install ts-odata-client
```

## Prerequisites
This library does not have any dependencies on any other NPM packages, but it does utilize the `fetch` and `Proxy` APIs. A pollyfil can be used for `fetch`, but there is currently no known pollyfil for `Proxy`; see [browser support](https://caniuse.com/?search=Proxy()).

## Supported Versions
Only OData version 4 is currently supported by this library.

## Quick Start
If you want to start coding immediately, install the NPM package, then use the following as reference.

```ts
import { ODataQuery} from 'ts-odata-client';

interface User {id: number; firstName: string; lastName: string; age: number};

const results = await ODataQuery.forV4<User>('http://domain.example/path/to/endpoint'/*, options object if needed*/)
  .filter(u => u.firstName.$startsWith('St').and(u.age.$greaterThanOrEqualTo(25))
  .select(u => ( { givenName: u.firstName, surname: u.lastName } ))
  .getManyAsync();
  
  console.log(results); // results is the json object that is returned by the OData service
  console.log(results.value); // results.value is of type Array<{givenName: string, surname: string}>
```

## Using a Data Context
The above is great for one-off queries, but if you have an OData service with mutliple endpoints, and you want to encapsulate that in a single class, then write a class that extends the provided `ODataContextV4` class

```ts
import { ODataV4Context } from 'ts-odata-client';

interface User {id: number; firstName: string; lastName: string; age: number};

class MyODataContext extends ODataV4Context {
  constructor(baseUrl: string) {
    super(baseUrl/*, options object if needed*/);
  }
  
  get users() { return this.createQuery<User>('relative/path/from/baseUrl'); }
}

// create instance and write query
const context = new MyODataContext('https://domain.example/odata/');
const result = await context.users
  .filter(u => u.firstName.$startsWith('St').and(u.age.$greaterThanOrEqualTo(25))
  .getManyAsync();
```

## Executing OData Functions
An OData function that returns a collection from an entity set can be treated just like any other endpoint, but it has the advantage that it can take parameter values

```ts
function callODataFunction(parameter: string)
// Remember: If the parameter is a string and it has a single quote in it, that will need to be escaped with two single quotes
const query = ODataQuery.forV4<User>(`http://domain.example/path/to/endpoint/function(myParameter='${parameter}')`/*, options object if needed*/);
```

`query` can now be used like any other OData Query (e.g., `filter`, `select`, `top`, etc.).


## Query Builder

This library also provides a query builder option that returns only the plain filter and query object, ensuring type safety. Utilizing the same syntax as `ODataQuery`, you can create precise filter expressions and query objects, For example:

```ts
// Create a type-safe filter expression
const result = ODataExpression.forV4<User>()
    .filter((p) => p.firstName.$equals("john"))
    .build();

console.log(results); 
// Output: { "$filter": "firstName eq 'john'", ... }
```

By employing the query builder, you can adhere to the familiar syntax of `ODataQuery` while obtaining a streamlined result containing only the essential filter and query information.

## Upgrading from v1.x to 2.x
2.0 introduces a number of breaking changes. The primary breaking changes are with the `filter`, `orderBy` and `orderByDescending` methods on the `ODataQuery` type.

### filter
  This method still accepts a `BooleanPredicateBuilder<T>` as an argument; however, the method signature alternative has now changed; instead of a `FilterBuilder` object, the provided argument for the method is now an `EntityProxy`. The best way to demonstrate the difference is with an example.
  
  ```ts
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
  
  ```ts
  const userQuery = ...
  
  //v1.x syntax:
  userQuery.orderBy('firstName');
  
  //v2.x syntax:
  userQuery.orderBy(u => u.firstName);
  //to sort on multiple properties
  userQuery.orderBy(u => [u.lastName, u.firstName]);
  ```

### New select overload
The `select` method maitains backwards compatibility, so no change is needed to existing code when updating, but an overload has been added that is more powerful than the one in version 1.x.

```ts
const userQuery = ...

//v1.x syntax:
const result = await userQuery.select('firstName', 'lastName').getManyAsync();
console.log(result): //{result: [{firstName: string, lastName: string}, ...]}

//v2.x syntax
const result = await userQuery.select(u => (
  {
    managerLastName: u.manager.lastName
  }
)).getManyAsync();
console.log(result); //{result: [{managerLastName: string}, ...]}
```

The v1.x syntax only allows you to pick and choose which top-level entity properties are returned. The v2.x syntax allows you to choose nested properties AND allows you to change the shape of what is returned to your code after it executes the query.

#### Important Notes/Limitations
Please note the following when using the newer style syntax:
1. JavaScript/TypeScript does not support a true expression syntax that allows the content of the method you provide to be inspected. For best results, simply return an object literal from the method and avoid attempting to do anything with the entity values other than assigning them directly to a field or an array.
1. Note the `()` surrounding the `{}` in the arrow method body. This is needed; wthout it, JavaScript/TypeScript assumes the `{}` are defining a new block, NOT an object literal.
1. The OData request will include the correct `$select` parameter, only returning the data that is needed for your custom object.
1. The method you pass in will be executed multiple times
   - It will be executed immediately before the `select` method returns; For this execution a dummy object is passed in as the parameter. This library will monitor what is accessed on the dummy object to determine which fields are needed. The return value, in this instance, is ignored.
   - When the data is retrieved from the OData service, the method will be called again, once for each result object; this time the real data object is passed in and the return value is what is ulitmately returned to the calling code.
