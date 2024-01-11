import { ODataExpression } from "../src";
import { describe, it, expect } from "vitest";
import type { ODataV4QuerySegments } from "../src/lib/ODataV4ExpressionVisitor";

describe("ODataExpression", () => {
  const baseExpression = ODataExpression.forV4<Person>();

  it("should produce empty object", () => {
    expect(baseExpression.provider.build()).toStrictEqual({});
  });

  it("should set select filter", () => {
    const query = baseExpression.select("firstName");

    expect(query.provider.build(query.expression)).toStrictEqual({
      select: ["firstName"],
    } satisfies ODataV4QuerySegments);
  });

  it("should set select filter with mulitple fields", () => {
    const query = baseExpression.select("firstName", "lastName");

    expect(query.provider.build(query.expression)).toStrictEqual({
      select: ["firstName", "lastName"],
    } satisfies ODataV4QuerySegments);
  });

  it("should set combination select filter", () => {
    const query = baseExpression.select("firstName", "lastName").select("lastName");

    expect(query.provider.build(query.expression)).toStrictEqual({
      select: ["lastName"],
    } satisfies ODataV4QuerySegments);
  });

  it("should set orderBy", () => {
    const query = baseExpression.orderBy((p) => p.firstName);

    expect(query.provider.build(query.expression)).toStrictEqual({
      orderBy: [{ field: "firstName" }],
    } satisfies ODataV4QuerySegments);
  });

  it("should set orderBy with multiple fields", () => {
    const query = baseExpression.orderBy((p) => [p.firstName, p.lastName]);

    expect(query.provider.build(query.expression)).toStrictEqual({
      orderBy: [{ field: "firstName" }, { field: "lastName" }],
    } satisfies ODataV4QuerySegments);
  });

  it("should set orderBy multiple times", () => {
    const query = baseExpression.orderBy((p) => [p.firstName, p.lastName]).orderBy((p) => p.age);

    expect(query.provider.build(query.expression)).toStrictEqual({
      orderBy: [{ field: "firstName" }, { field: "lastName" }, { field: "age" }],
    } satisfies ODataV4QuerySegments);
  });

  it("should set orderByDescending", () => {
    const query = baseExpression.orderByDescending((p) => p.firstName);

    expect(query.provider.build(query.expression)).toStrictEqual({
      orderBy: [{ field: "firstName", sort: "desc" }],
    } satisfies ODataV4QuerySegments);
  });

  it("should set orderByDescending with multiple fields", () => {
    const query = baseExpression.orderByDescending((p) => [p.firstName, p.lastName]);

    expect(query.provider.build(query.expression)).toStrictEqual({
      orderBy: [
        { field: "firstName", sort: "desc" },
        { field: "lastName", sort: "desc" },
      ],
    } satisfies ODataV4QuerySegments);
  });

  it("should set orderByDescending multiple times", () => {
    const query = baseExpression.orderByDescending((p) => [p.firstName, p.lastName]).orderByDescending((p) => p.age);

    expect(query.provider.build(query.expression)).toStrictEqual({
      orderBy: [
        { field: "firstName", sort: "desc" },
        { field: "lastName", sort: "desc" },
        { field: "age", sort: "desc" },
      ],
    } satisfies ODataV4QuerySegments);
  });

  it("should set orderBy and orderByDescending multiple times", () => {
    const query = baseExpression
      .orderByDescending((p) => p.firstName)
      .orderBy((p) => p.age)
      .orderByDescending((p) => p.lastName);

    expect(query.provider.build(query.expression)).toStrictEqual({
      orderBy: [{ field: "firstName", sort: "desc" }, { field: "age" }, { field: "lastName", sort: "desc" }],
    } satisfies ODataV4QuerySegments);
  });

  it("should set skip", () => {
    const query = baseExpression.skip(10);

    expect(query.provider.build(query.expression)).toStrictEqual({
      skip: 10,
    } satisfies ODataV4QuerySegments);
  });

  it("should ignore skip if set to 0", () => {
    const query = baseExpression.skip(0);

    expect(query.provider.build(query.expression)).toStrictEqual({
      skip: 0,
    } satisfies ODataV4QuerySegments);
  });

  it("should set last skip value provided", () => {
    const query = baseExpression.skip(10).skip(5);

    expect(query.provider.build(query.expression)).toStrictEqual({
      skip: 5,
    } satisfies ODataV4QuerySegments);
  });

  it("should set top", () => {
    const query = baseExpression.top(10);

    expect(query.provider.build(query.expression)).toStrictEqual({
      top: 10,
    } satisfies ODataV4QuerySegments);
  });

  it("should set top to 0", () => {
    const query = baseExpression.top(0);

    expect(query.provider.build(query.expression)).toStrictEqual({
      top: 0,
    } satisfies ODataV4QuerySegments);
  });

  it("should set last skip value provided", () => {
    const query = baseExpression.top(10).top(5);

    expect(query.provider.build(query.expression)).toStrictEqual({
      top: 5,
    } satisfies ODataV4QuerySegments);
  });

  it("should handle cumulative expand", () => {
    const query = baseExpression.expand("children");

    expect(query.provider.build(query.expression)).toStrictEqual({
      expand: ["children"],
    } satisfies ODataV4QuerySegments);
  });

  it("should handle cumulative expands", () => {
    const query = baseExpression.expand("children").expand("mother");

    expect(query.provider.build(query.expression)).toStrictEqual({
      expand: ["children", "mother"],
    } satisfies ODataV4QuerySegments);
  });

  it("should handle mulitple expands in one call", () => {
    const query = baseExpression.expand("children", "mother");

    expect(query.provider.build(query.expression)).toStrictEqual({
      expand: ["children", "mother"],
    } satisfies ODataV4QuerySegments);
  });

  it("should not repeat expands", () => {
    const query = baseExpression.expand("children", "mother").expand("mother");

    expect(query.provider.build(query.expression)).toStrictEqual({
      expand: ["children", "mother"],
    } satisfies ODataV4QuerySegments);
  });

  it("should allow expand on non-array types", () => {
    const query = baseExpression.expand("mother");

    expect(query.provider.build(query.expression)).toStrictEqual({
      expand: ["mother"],
    } satisfies ODataV4QuerySegments);
  });

  it("should find all properties", () => {
    const query = baseExpression.select((p) => ({
      foo: { bar: p.email },
      baz: p.firstName,
      zap: p.mother.lastName,
      dupe: p.email,
      constNumber: 5,
      constBoolean: false,
      constString: "test",
    }));

    expect(query.provider.build(query.expression)).toStrictEqual({
      select: ["email", "firstName", "mother/lastName"],
    } satisfies ODataV4QuerySegments);
  });

  it("should find all properties", () => {
    const outsideVariable = "test";
    const query = baseExpression.select((p) => ({
      foo: { bar: p.email },
      names: [p.firstName, p.lastName],
      zap: p.mother.lastName,
      dupe: p.email,
      constNumber: 5,
      constBoolean: false,
      constString: outsideVariable,
    }));

    expect(query.provider.build(query.expression)).toStrictEqual({
      select: ["email", "firstName", "lastName", "mother/lastName"],
    } satisfies ODataV4QuerySegments);
  });

  it("should call build", () => {
    const expression = ODataExpression.forV4<Person>().select("firstName", "lastName").build();
    expect(expression).toStrictEqual({
      select: ["firstName", "lastName"],
    } satisfies ODataV4QuerySegments);
  });
});

interface Person {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  children: Person[];
  pets: string[];
  mother: Person;
  dateOfBirth: Date;
}
