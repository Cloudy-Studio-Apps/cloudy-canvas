import Papa from "papaparse";

import { t } from "../data.i18n";
import type { DataFormat } from "../data.points.types";
import { columnNames } from "./column-names";
import { rawText } from "./raw-text";

const DELIMITERS: Record<string, string> = { auto: "", ",": ",", ";": ";", tab: "\t", "|": "|" };

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
