/** An expression that doesn't read, with where (a character index) it stops making sense. */
export class ExpressionError extends Error {
  constructor(
    message: string,
    readonly at: number,
  ) {
    super(message);
    this.name = "ExpressionError";
  }
}
