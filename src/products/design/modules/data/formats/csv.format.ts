import Papa from "papaparse";

import { t } from "../data.i18n";
import type { DataFormat } from "../data.points.types";
import { rawText } from "./raw-text";

const DELIMITERS: Record<string, string> = { auto: "", ",": ",", ";": ";", tab: "\t", "|": "|" };

/** Names for `width` columns: empty ones `column_N`, repeated ones `name_2`, `name_3`, all unique. */
function columnNames(header: string[], width: number): string[] {
  const used = new Set<string>();
  return Array.from({ length: width }, (_, i) => {
    const raw = header[i] ?? "";
    const base = raw.trim() === "" ? `column_${i + 1}` : raw;
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base}_${n}`;
    used.add(name);
    return name;
  });
}

/** CSV and TSV: rows become objects of strings (types come from `guessFields`). */
export const CSV_FORMAT: DataFormat = {
  id: "csv",
  get label() {
    return t("formats.csv.label");
  },
  extensions: ["csv", "tsv"],
  mimes: ["text/csv", "text/tab-separated-values"],
  get options() {
    return [
      {
        key: "delimiter",
        kind: "select" as const,
        label: t("formats.csv.delimiter"),
        options: [
          { value: "auto", label: t("formats.csv.delimiterAuto") },
          { value: ",", label: t("formats.csv.delimiterComma") },
          { value: ";", label: t("formats.csv.delimiterSemicolon") },
          { value: "tab", label: t("formats.csv.delimiterTab") },
          { value: "|", label: t("formats.csv.delimiterPipe") },
        ],
      },
      {
        key: "header",
        kind: "boolean" as const,
        label: t("formats.csv.header"),
        default: true,
      },
    ];
  },
  sniff(raw) {
    const text = rawText(raw).trimStart();
    if (text === "" || text.startsWith("{") || text.startsWith("[")) return false;
    const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
    return /[,;\t|]/.test(firstLine);
  },
  async parse(raw, options) {
    const delimiter = DELIMITERS[String(options.delimiter ?? "auto")] ?? "";
    const hasHeader = options.header !== false;
    const result = Papa.parse<string[]>(rawText(raw), {
      header: false,
      delimiter,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
    });
    const fatal = result.errors.find(
      (e) => e.code !== "TooFewFields" && e.code !== "UndetectableDelimiter",
    );
    if (fatal)
      throw new Error(
        `CSV: ${fatal.message}` + (fatal.row === undefined ? "" : ` (row ${fatal.row + 1}).`),
      );
    const matrix = result.data;
    const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
    const first = matrix[0] ?? [];
    const names = columnNames(hasHeader ? first : [], width);
    const body = hasHeader ? matrix.slice(1) : matrix;
    return body.map((row) => {
      const out: Record<string, string> = {};
      names.forEach((name, i) => {
        out[name] = row[i] ?? "";
      });
      return out;
    });
  },
};
