/** One kind of loss an import counted: a product's message code, its values and how often. */
export interface ImportWarning<Code extends string = string> {
  code: Code;
  /** The message's placeholders (a Figma type name, a widget's name), when it has any. */
  values?: Readonly<Record<string, string>>;
  count: number;
}
