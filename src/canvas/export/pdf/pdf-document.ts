import { strToU8, zlibSync } from "fflate";

import type { PdfBox, PdfPageLayout, PdfResourceKind } from "./pdf-writer.types";
import { pdfNumber } from "./pdf-matrix";

const NAME_PREFIX: Readonly<Record<PdfResourceKind, string>> = {
  ExtGState: "G",
  Pattern: "P",
  XObject: "X",
  Font: "F",
};

const boxOf = (box: PdfBox) => box.map(pdfNumber).join(" ");

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
  private readonly pages: number[] = [];
  /** The page tree's number, reserved by the first page because pages point back at it. */
  private tree: number | null = null;
  private readonly finishers: (() => void)[] = [];

  /** Adds an object from its body (a dictionary, an array…) and returns its number. */
  add(body: string): number {
    this.objects.push(strToU8(body));
    return this.objects.length;
  }

  /** Reserves an object for something only known at the end, filled with `fill`. */
  reserve(): number {
    return this.add("null");
  }

  fill(ref: number, body: string): void {
    this.objects[ref - 1] = strToU8(body);
  }

  /** Runs `finish` once every page is in, to write what depends on all of them. */
  beforeSave(finish: () => void): void {
    this.finishers.push(finish);
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

  /** Adds a page showing `content`, after the ones so far. */
  addPage({ width, height, boxes }: PdfPageLayout, content: PdfContent): void {
    this.tree ??= this.reserve();
    const stream = this.content("", content);
    this.pages.push(
      this.add(
        `<< /Type /Page /Parent ${this.tree} 0 R ` +
          `/MediaBox [0 0 ${pdfNumber(width)} ${pdfNumber(height)}] ` +
          (boxes ? `/TrimBox [${boxOf(boxes.trim)}] /BleedBox [${boxOf(boxes.bleed)}] ` : "") +
          `/Contents ${stream} 0 R /Resources ${content.resources()} >>`,
      ),
    );
  }

  /** The whole file, of the pages added. */
  save(): Blob {
    if (this.tree === null) throw new Error("A PDF needs at least one page.");
    for (const finish of this.finishers.splice(0)) finish();
    const kids = this.pages.map((page) => `${page} 0 R`).join(" ");
    this.fill(this.tree, `<< /Type /Pages /Kids [${kids}] /Count ${this.pages.length} >>`);
    const catalog = this.add(`<< /Type /Catalog /Pages ${this.tree} 0 R >>`);
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
