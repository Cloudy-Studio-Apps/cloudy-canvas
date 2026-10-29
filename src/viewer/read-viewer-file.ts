import type { ViewerFile } from "@board/modules/viewer";

/** The board the exported file carries: base64 of gzipped JSON in its `#cloudy-board` script. */
export async function readViewerFile(): Promise<ViewerFile> {
  const text = document.getElementById("cloudy-board")?.textContent?.trim();
  if (!text) throw new Error("The file carries no board.");
  const bytes = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  const json = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const file = JSON.parse(await new Response(json).text()) as ViewerFile;
  if (file.format !== 1) throw new Error(`Unknown board format ${String(file.format)}.`);
  return file;
}
