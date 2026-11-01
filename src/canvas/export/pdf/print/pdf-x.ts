import { strToU8, zlibSync } from "fflate";

import { createId } from "@shared/core";

import type { PdfDocument } from "../pdf-document";
import type { PdfPrintColor } from "./pdf-print.types";
import { pdfXmp } from "./pdf-xmp";

const PRODUCER = "Cloudy Canvas";
/** What each standard needs of the file. */
const STANDARDS = {
  x4: { version: "1.6", info: "/GTS_PDFXVersion (PDF/X-4)" },
  x1a: {
    version: "1.4",
    info: "/GTS_PDFXVersion (PDF/X-1:2003) /GTS_PDFXConformance (PDF/X-1a:2003)",
  },
} as const;

/** Text as a PDF string that holds any character. */
function pdfText(text: string): string {
  const units = Array.from({ length: text.length }, (_, i) => text.charCodeAt(i));
  const hex = units.map((unit) => unit.toString(16).padStart(4, "0")).join("");
  return `<FEFF${hex}>`;
}

/** A date as PDF writes it, with its zone. */
function pdfDate(date: Date): string {
  const two = (value: number) => String(value).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const zone = `${offset < 0 ? "-" : "+"}${two(Math.floor(Math.abs(offset) / 60))}'${two(Math.abs(offset) % 60)}'`;
  const day = `${date.getFullYear()}${two(date.getMonth() + 1)}${two(date.getDate())}`;
  return `D:${day}${two(date.getHours())}${two(date.getMinutes())}${two(date.getSeconds())}${zone}`;
}

/**
 * Makes a press file of `doc`, when it saves: the standard's version and identification, its
 * document information, and the output intent, which embeds the profile the colors were converted
 * for, so a print shop can see what the file was made for.
 */
export function markPdfX(doc: PdfDocument, color: PdfPrintColor): void {
  doc.beforeSave(() => {
    const { standard, profile, profileName, title } = color;
    const { version, info } = STANDARDS[standard];
    const now = new Date();
    const stream = doc.stream(
      `/N 4 /Alternate /DeviceCMYK /Filter /FlateDecode`,
      zlibSync(profile),
    );
    const intent = doc.add(
      `<< /Type /OutputIntent /S /GTS_PDFX /OutputConditionIdentifier ${pdfText("Custom")} ` +
        `/OutputCondition ${pdfText(profileName)} /Info ${pdfText(profileName)} ` +
        `/DestOutputProfile ${stream} 0 R >>`,
    );
    const metadata =
      standard === "x4"
        ? doc.stream(
            "/Type /Metadata /Subtype /XML",
            strToU8(pdfXmp({ title, producer: PRODUCER, date: now, id: createId() })),
          )
        : null;
    doc.identify({
      version,
      info: doc.add(
        `<< /Title ${pdfText(title)} /Creator ${pdfText(PRODUCER)} /Producer ${pdfText(PRODUCER)} ` +
          `/CreationDate (${pdfDate(now)}) /ModDate (${pdfDate(now)}) /Trapped /False ${info} >>`,
      ),
      catalog:
        `/OutputIntents [${intent} 0 R]` + (metadata === null ? "" : ` /Metadata ${metadata} 0 R`),
      id: createId().replaceAll("-", ""),
    });
  });
}
