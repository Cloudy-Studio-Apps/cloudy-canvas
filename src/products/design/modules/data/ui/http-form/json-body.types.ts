/** What a value of a JSON body built from rows is. */
export type JsonValueKind = "text" | "number" | "boolean" | "null";

/** One name and value of a JSON body built from rows. */
export interface JsonRow {
  id: string;
  name: string;
  kind: JsonValueKind;
  value: string;
}

/** Why JSON text doesn't parse: where, when the engine says. */
export interface JsonProblem {
  line: number | null;
}
