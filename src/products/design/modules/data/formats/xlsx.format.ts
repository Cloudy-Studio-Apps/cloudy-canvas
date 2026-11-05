import { t } from "../data.i18n";
import type { DataFormat } from "../data.points.types";
import { sheetRows } from "./sheet-rows";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Excel workbooks (`.xlsx`): one sheet becomes rows of typed values (numbers stay numbers, dates
 * become ISO strings, empty cells `null`). The library is loaded with `import()` only when a
 * workbook is parsed, so it is a separate chunk.
 */
export const XLSX_FORMAT: DataFormat = {
  id: "xlsx",
  get label() {
    return t("formats.xlsx.label");
  },
  extensions: ["xlsx"],
  mimes: [XLSX_MIME],
  get options() {
    return [
      {
        key: "sheet",
        kind: "text" as const,
        label: t("formats.xlsx.sheet"),
        placeholder: t("formats.xlsx.sheetPlaceholder"),
      },
      { key: "headerRow", kind: "number" as const, label: t("formats.xlsx.headerRow"), min: 1 },
    ];
  },
  sniff(raw) {
    const b = raw.bytes;
    return (
      !!b &&
      b[0] === 0x50 &&
      b[1] === 0x4b &&
      b[2] === 0x03 &&
      b[3] === 0x04 &&
      (raw.fileName ?? "").toLowerCase().endsWith(".xlsx")
    );
  },
  async parse(raw, options) {
    if (!raw.bytes) throw new Error("Excel: the file's bytes are missing.");
    // The package has no root export: the browser entry is the one for the webview and the web.
    const { default: readXlsxFile } = await import("read-excel-file/browser");
    let sheets;
    try {
      sheets = await readXlsxFile(new Blob([raw.bytes as BlobPart]));
    } catch (e) {
      throw new Error(`Excel: ${e instanceof Error ? e.message : String(e)}`, { cause: e });
    }
    const wanted = String(options.sheet ?? "").trim();
    let found = sheets[0];
    if (wanted !== "") {
      found =
        sheets.find((s) => s.sheet === wanted) ??
        sheets.find((s) => s.sheet.toLowerCase() === wanted.toLowerCase()) ??
        (/^\d+$/.test(wanted) ? sheets[Number(wanted) - 1] : undefined);
      if (!found) {
        throw new Error(
          `Excel: no sheet "${wanted}". Sheets: ${sheets.map((s) => s.sheet).join(", ")}.`,
        );
      }
    }
    if (!found) return [];
    const headerRow = typeof options.headerRow === "number" ? options.headerRow : 0;
    return sheetRows(found.data, headerRow);
  },
};
