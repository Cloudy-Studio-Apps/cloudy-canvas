const ENTITIES: Readonly<Record<string, string>> = {
  '"': "#quot;",
  "#": "#35;",
  "`": "#96;",
  "<": "#lt;",
  ">": "#gt;",
};

/** Text for inside a Mermaid label's quotes, on one line. */
export function mermaidText(text: string): string {
  const line = text.replace(/\s+/g, " ").trim();
  return line.replace(/["#`<>]/g, (char) => ENTITIES[char] ?? char);
}
