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
    const { readSheet, SheetNotFoundError } = await import("read-excel-file/browser");
    const blob = new Blob([raw.bytes as BlobPart]);
    const wanted = String(options.sheet ?? "").trim();
    const headerRow = options.headerRow;
    if (headerRow !== undefined && headerRow !== null && headerRow !== "") {
      if (typeof headerRow !== "number" || !Number.isInteger(headerRow) || headerRow < 1) {
        throw new Error("Excel: the header row must be a whole number, 1 or more.");
      }
    }
    const read = async (sheet?: string | number) => {
      try {
        return await (sheet === undefined ? readSheet(blob) : readSheet(blob, sheet));
      } catch (e) {
        if (e instanceof SheetNotFoundError || !(e instanceof Error)) throw e;
        throw new Error(`Excel: ${e.message}`, { cause: e });
      }
    };
    let data;
    try {
      data = await read(wanted === "" ? undefined : wanted);
    } catch (e) {
      if (!(e instanceof SheetNotFoundError)) throw e;
      // `sheets` (the names) is on the error but missing from the package's typings.
      const names = (e as { sheets?: string[] }).sheets ?? [];
      const byName = names.find((n) => n.toLowerCase() === wanted.toLowerCase());
      const byNumber = /^\d+$/.test(wanted) && Number(wanted) <= names.length ? Number(wanted) : 0;
      if (byName === undefined && byNumber < 1) {
        throw new Error(`Excel: no sheet "${wanted}". Sheets: ${names.join(", ")}.`, { cause: e });
      }
      data = await read(byName ?? byNumber);
    }
    return sheetRows(data, typeof headerRow === "number" ? headerRow : 0);
  },
};
