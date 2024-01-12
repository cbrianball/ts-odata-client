import { ODataExpression } from "../src";
import { lambdaVariable } from "../src/lib/ProxyTypes";
import type { ODataV4QuerySegments } from "../src/lib/ODataV4ExpressionVisitor";
import { describe, it, expect } from "vitest";

describe("useProxy", () => {
  const baseQuery = ODataExpression.forV4<Person>();

  it("should set simple filter", () => {
    const query = baseQuery.filter((p) => p.firstName.$equals("john"));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName eq 'john'",
    } satisfies ODataV4QuerySegments);
  });

  it("should set compound filter", () => {
    const query = baseQuery.filter((p) => p.firstName.$equals("john").and(p.age.$greaterThanOrEqualTo(30)));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName eq 'john' and age ge 30",
    } satisfies ODataV4QuerySegments);
  });

  it("should set complex filter", () => {
    const query = baseQuery.filter((p) =>
      p.firstName.$equals("john").and(p.age.$greaterThanOrEqualTo(30).or(p.lastName.$notEquals("Jones"))),
    );
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName eq 'john' and (age ge 30 or lastName ne 'Jones')",
    } satisfies ODataV4QuerySegments);
  });

  it("should set complex filter", () => {
    const query = baseQuery.filter((p) =>
      p.firstName
        .$equals("john")
        .and(p.age.$greaterThanOrEqualTo(30))
        .or(p.lastName.$notEquals("Jones").and(p.email.$equals(".com"))),
    );

    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "(firstName eq 'john' and age ge 30) or (lastName ne 'Jones' and email eq '.com')",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle contains", () => {
    const query = baseQuery.filter((p) => p.firstName.$contains("jac"));

    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "contains(firstName,'jac')",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle startsWith", () => {
    const query = baseQuery.filter((p) => p.firstName.$startsWith("jac"));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "startsWith(firstName,'jac')",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle endsWith", () => {
    const query = baseQuery.filter((p) => p.firstName.$endsWith("jac"));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "endsWith(firstName,'jac')",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle equals and notEquals", () => {
    const query = baseQuery.filter((p, { and }) => and(p.firstName.$equals("jac"), p.age.$notEquals(50)));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName eq 'jac' and age ne 50",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle greaterThan and greaterThanEqualTo", () => {
    const query = baseQuery.filter((p, { and }) =>
      and(p.firstName.$greaterThan("jac"), p.age.$greaterThanOrEqualTo(50)),
    );
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName gt 'jac' and age ge 50",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle lessThan and lessThanEqualTo", () => {
    const query = baseQuery.filter((p, { and }) => and(p.firstName.$lessThan("jac"), p.age.$lessThanOrEqualTo(50)));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName lt 'jac' and age le 50",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle null comparisons", () => {
    const query = baseQuery.filter((p) => p.firstName.$equals(null));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName eq null",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle undefined comparisons", () => {
    const query = baseQuery.filter((p) => p.firstName.$equals(undefined));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "firstName eq null",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle not", () => {
    const query = baseQuery.filter((p, { not }) => not(p.firstName.$equals("John")));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "not firstName eq 'John'",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle navigation properties", () => {
    const query = baseQuery.filter((p, { not }) => not(p.mother.firstName.$equals("Jane")));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "not mother/firstName eq 'Jane'",
    } satisfies ODataV4QuerySegments);
  });

  it("should handle any", () => {
    const query = baseQuery.filter((p) => p.lastName.$in(["Jones", "Smith", "Ng"]));
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "lastName in ('Jones','Smith','Ng')",
    } satisfies ODataV4QuerySegments);
  });

  it("should work with non-filter operators", () => {
    const query = baseQuery
      .orderBy((p) => [p.age])
      .filter((p) => p.lastName.$in(["Jones", "Smith", "Ng"]))
      .select("firstName", "lastName");
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: "lastName in ('Jones','Smith','Ng')",
      orderBy: [{ field: "age" }],
      select: ["firstName", "lastName"],
    } satisfies ODataV4QuerySegments);
  });

  it("should handle 'any' entity collection query", () => {
    let variable = "";
    const query = baseQuery.filter((p) =>
      p.children.$any((c) => {
        variable = c[lambdaVariable];
        return c.age.$equals(4);
      }),
    );
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: `children/any(${variable}: ${variable}/age eq 4)`,
    } satisfies ODataV4QuerySegments);
  });

  it("should handle 'all' entity collection query", () => {
    let variable = "";
    const query = baseQuery.filter((p) =>
      p.children.$all((c) => {
        variable = c[lambdaVariable];
        return c.age.$equals(4);
      }),
    );
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: `children/all(${variable}: ${variable}/age eq 4)`,
    } satisfies ODataV4QuerySegments);
  });

  it("should handle 'all' entity collection query with contains", () => {
    let variable = "";
    const query = baseQuery.filter((p) =>
      p.children.$all((c) => {
        variable = c[lambdaVariable];
        return c.firstName.$contains("efg");
      }),
    );
    expect(query.provider.build(query.expression)).toStrictEqual({
      filter: `children/all(${variable}: contains(${variable}/firstName,'efg'))`,
    } satisfies ODataV4QuerySegments);
  });
});

interface Person {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  children: Child[];
  pets: string[];
  mother: Person;
  father: Person;
}

interface Child {
  firstName: string;
  lastName: string;
  age: number;
}
