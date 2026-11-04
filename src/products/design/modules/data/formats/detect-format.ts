import type { DataFormat } from "../data.points.types";
import type { RawData } from "../services";

function extensionOf(name: string | undefined): string {
  const dot = name?.lastIndexOf(".") ?? -1;
  return name && dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** The format for raw data: by file extension, then mime type, then each format's `sniff`. */
export function detectFormat(raw: RawData, formats: DataFormat[]): DataFormat | null {
  const ext = extensionOf(raw.fileName);
  if (ext) {
    const byExt = formats.find((f) => f.extensions.includes(ext));
    if (byExt) return byExt;
  }
  const mime = raw.mime?.split(";")[0]?.trim().toLowerCase();
  if (mime) {
    const byMime = formats.find((f) => f.mimes.includes(mime));
    if (byMime) return byMime;
  }
  return formats.find((f) => f.sniff?.(raw)) ?? null;
}
