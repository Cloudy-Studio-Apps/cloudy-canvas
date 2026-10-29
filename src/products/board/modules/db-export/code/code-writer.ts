/** Builds source text line by line with indentation. `toString` ends with one newline. */
export class CodeWriter {
  private readonly out: string[] = [];
  private depth = 0;

  constructor(private readonly unit: string) {}

  /** One line at the current indentation; no text writes an empty line. */
  line(text = ""): this {
    this.out.push(text === "" ? "" : this.unit.repeat(this.depth) + text);
    return this;
  }

  /** Several lines at the current indentation. */
  lines(texts: readonly string[]): this {
    for (const text of texts) this.line(text);
    return this;
  }

  /** `open`, the body one level in, then `close`. */
  block(open: string, close: string, body: () => void): this {
    this.line(open);
    this.indent(body);
    return this.line(close);
  }

  /** The body one level in. */
  indent(body: () => void): this {
    this.depth += 1;
    body();
    this.depth -= 1;
    return this;
  }

  toString(): string {
    const text = this.out.join("\n").replace(/\n{3,}/g, "\n\n");
    return `${text.trimEnd()}\n`;
  }
}
