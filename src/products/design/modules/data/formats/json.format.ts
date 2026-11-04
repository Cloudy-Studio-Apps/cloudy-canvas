import type { DataFormat } from "../data.points.types";
import { t } from "../data.i18n";
import { rawText } from "./raw-text";

/** JSON, and NDJSON (one value per line) when the whole text is not one JSON value. */
export const JSON_FORMAT: DataFormat = {
  id: "json",
  get label() {
    return t("formats.json.label");
  },
  extensions: ["json", "ndjson", "jsonl"],
  mimes: ["application/json", "application/x-ndjson", "application/jsonl"],
  sniff(raw) {
    const text = rawText(raw).trimStart();
    return text.startsWith("{") || text.startsWith("[");
  },
  async parse(raw) {
    const text = rawText(raw);
    try {
      return JSON.parse(text);
    } catch (whole) {
      const lines = text
        .split(/\r?\n/)
        .map((line, i) => ({ line, number: i + 1 }))
        .filter(({ line }) => line.trim() !== "");
      const failure = () =>
        new Error(`JSON: ${whole instanceof Error ? whole.message : String(whole)}`, {
          cause: whole,
        });
      if (lines.length < 2) throw failure();
      return lines.map(({ line, number }, i) => {
        try {
          return JSON.parse(line);
        } catch (lineError) {
          if (i === 0) throw failure();
          throw new Error(`NDJSON: line ${number} is not valid JSON.`, { cause: lineError });
        }
      });
    }
  },
};
