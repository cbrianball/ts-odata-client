# ts-odata-client

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/cbrianball/ts-odata-client/CI/main?style=plastic)
![npm](https://img.shields.io/npm/v/ts-odata-client?style=plastic)

A simple library for creating and executing OData queries. Makes heavy use of TypeScript for a better developer experience.

# Supported Versions
Only OData version 4 is currently supported by this library.

# Quick Start
If you want to start coding immediately, install the NPM package, then use the following as reference:

```typescript
import { ODataQuery} from 'ts-odata-client';

interface User {id: number; firstName: string; lastName: string; age: number};

const results = await ODataQuery.forV4<User>('http://domain.example/path/to/endpoint' /*, optional function parameter to initialize fetch request */)
  .filter(f => f.startsWith('firstName', 'St').and(f.greaterThanOrEqualTo('age', 25))
  .select('firstName', 'lastName')
  .getManyAsync();
  
  console.log(results); // results is the json object that is returned by the OData service
  console.log(results.value); // results.value is of type Array<{firstName: string, lastName: string}>
```

# Using a Data Context
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
  .filter(f => f.startsWith('firstName', 'St').and(f.greaterThanOrEqualTo('age', 25))
  .select('firstName', 'lastName')
  .getManyAsync();
```

# Executing OData functions
An OData function that returns a collection from an entity set can be treated just like any other endpoint, but it has the advantage that it can take parameter values

```typescript
function callODataFunction(parameter: string)
// Remember: If the parameter is a string and it has a single quote in it, that will need to be escaped with two single quotes
const query = ODataQuery.forV4<User>(`http://domain.example/path/to/endpoint/function(myParameter='${parameter}')` /*, optional function parameter to initialize fetch request */);
```

`query` can now be used like any other OData Query (e.g., `filter`, `select`, `top`, etc.).
