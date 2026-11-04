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
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length < 2) {
        throw new Error(`JSON: ${whole instanceof Error ? whole.message : String(whole)}`, {
          cause: whole,
        });
      }
      return lines.map((line, i) => {
        try {
          return JSON.parse(line);
        } catch (lineError) {
          throw new Error(`NDJSON: line ${i + 1} is not valid JSON.`, { cause: lineError });
        }
      });
    }
  },
};
