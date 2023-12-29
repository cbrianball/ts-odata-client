/**
 * Represents a literal value, the provided type may be different than that of the runtime type (e.g., Guid instead of a string).
 */
export class Literal {
  constructor(
    public value: unknown,
    public literalType?: string,
  ) {}
}
