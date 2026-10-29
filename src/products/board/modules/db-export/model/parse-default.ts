import type { CodeDefault } from "./code-schema.types";

/** A raw DBML default (`0`, `'draft'`, `true`, `null`, `` `now()` ``) as a `CodeDefault`. */
export function parseDefault(raw: string | null): CodeDefault | null {
  if (raw === null) return null;
  const text = raw.trim();
  if (text === "") return null;
  if (text.startsWith("`") && text.endsWith("`")) return { kind: "expr", value: text.slice(1, -1) };
  const quoted = /^(['"])(.*)\1$/s.exec(text);
  if (quoted) return { kind: "string", value: (quoted[2] ?? "").replace(/\\(['"\\])/g, "$1") };
  const lower = text.toLowerCase();
  if (lower === "true" || lower === "false") return { kind: "boolean", value: lower };
  if (lower === "null") return { kind: "null", value: "null" };
  if (Number.isFinite(Number(text))) return { kind: "number", value: text };
  // A bare word DBML allows (an enum value): a string.
  return { kind: "string", value: text };
}
