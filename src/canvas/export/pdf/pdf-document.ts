import { strToU8, zlibSync } from "fflate";

import type { PdfPageLayout, PdfResourceKind } from "./pdf-writer.types";
import { pdfNumber } from "./pdf-matrix";

const NAME_PREFIX: Readonly<Record<PdfResourceKind, string>> = {
  ExtGState: "G",
  Pattern: "P",
  XObject: "X",
  Font: "F",
};

/** A content stream being written: its operators and the resources they name. */
export class PdfContent {
  readonly ops: string[] = [];
  private readonly used = new Map<PdfResourceKind, Map<number, string>>();
  private next = 0;

  /** The name `ref` goes by in this stream. */
  name(kind: PdfResourceKind, ref: number): string {
    let names = this.used.get(kind);
    if (!names) this.used.set(kind, (names = new Map()));
    let name = names.get(ref);
    if (!name) names.set(ref, (name = `${NAME_PREFIX[kind]}${this.next++}`));
    return name;
  }

  resources(): string {
    const kinds = [...this.used].map(([kind, names]) => {
      const entries = [...names].map(([ref, name]) => `/${name} ${ref} 0 R`);
      return `/${kind} << ${entries.join(" ")} >>`;
    });
    return `<< ${kinds.join(" ")} >>`;
  }
}

/** A PDF file's objects, written out with their cross-reference table. */
export class PdfDocument {
  private readonly objects: Uint8Array[] = [];

  /** Adds an object from its body (a dictionary, an array…) and returns its number. */
  add(body: string): number {
    this.objects.push(strToU8(body));
    return this.objects.length;
  }

  /** Adds a stream whose `data` is encoded already; `dict` holds the entries besides `/Length`. */
  stream(dict: string, data: Uint8Array): number {
    const head = strToU8(`<< ${dict} /Length ${data.length} >>\nstream\n`);
    const tail = strToU8("\nendstream");
    const object = new Uint8Array(head.length + data.length + tail.length);
    object.set(head);
    object.set(data, head.length);
    object.set(tail, head.length + data.length);
    this.objects.push(object);
    return this.objects.length;
  }

  /** Adds a content stream, compressed, with `dict`'s entries. */
  content(dict: string, content: PdfContent): number {
    const entries = `${dict} /Resources ${content.resources()} /Filter /FlateDecode`;
    return this.stream(entries, zlibSync(strToU8(content.ops.join("\n"))));
  }

  /** The whole file, of one page showing `content`. */
  save({ width, height }: PdfPageLayout, content: PdfContent): Blob {
    const stream = this.content("", content);
    const pages = this.objects.length + 1;
    const page = this.add(
      `<< /Type /Page /Parent ${pages + 1} 0 R ` +
        `/MediaBox [0 0 ${pdfNumber(width)} ${pdfNumber(height)}] ` +
        `/Contents ${stream} 0 R /Resources ${content.resources()} >>`,
    );
    const tree = this.add(`<< /Type /Pages /Kids [${page} 0 R] /Count 1 >>`);
    const catalog = this.add(`<< /Type /Catalog /Pages ${tree} 0 R >>`);
    return this.file(catalog);
  }

  private file(root: number): Blob {
    const parts: Uint8Array[] = [strToU8("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n", true)];
    let offset = parts[0]!.length;
    const offsets: number[] = [];
    this.objects.forEach((object, i) => {
      offsets.push(offset);
      const head = strToU8(`${i + 1} 0 obj\n`);
      const tail = strToU8("\nendobj\n");
      parts.push(head, object, tail);
      offset += head.length + object.length + tail.length;
    });
    const rows = offsets.map((at) => `${String(at).padStart(10, "0")} 00000 n \n`).join("");
    const size = this.objects.length + 1;
    parts.push(
      strToU8(
        `xref\n0 ${size}\n0000000000 65535 f \n${rows}` +
          `trailer\n<< /Size ${size} /Root ${root} 0 R >>\nstartxref\n${offset}\n%%EOF\n`,
      ),
    );
    return new Blob(parts as BlobPart[], { type: "application/pdf" });
  }
}
