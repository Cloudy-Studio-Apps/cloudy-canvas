/** Where a variable or a style is used (see `tokenUsage`). */
export interface TokenUsage {
  /** Elements bound to it directly (a field, a style path, a text range's style). */
  layers: string[];
  /** Elements bound to a style that uses it (variables only). */
  viaStyles: string[];
  /** Variables whose values alias it directly. */
  aliases: string[];
  /** Styles binding it (variables only). */
  styles: string[];
  /** Shade generators and number scales following it as their base. */
  generators: string[];
}
