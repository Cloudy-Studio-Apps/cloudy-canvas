import type { ViewerFile } from "../../viewer-file.types";
import { bytesToBase64 } from "./bytes-to-base64";

/** Where the viewer runtime's HTML takes the board's data. */
export const VIEWER_DATA_MARKER = "<!--cloudy-board-data-->";

/**
 * The HTML file: the viewer runtime with the board's data (gzipped JSON, base64, so nothing in
 * the board can be read as HTML) in place of its marker, and its title and description.
 */
export async function encodeViewerHtml(runtime: string, file: ViewerFile): Promise<Blob> {
  if (!runtime.includes(VIEWER_DATA_MARKER)) {
    throw new Error("The viewer runtime has no place for the board's data.");
  }
  const json = new Blob([JSON.stringify(file)]).stream().pipeThrough(new CompressionStream("gzip"));
  const data = bytesToBase64(new Uint8Array(await new Response(json).arrayBuffer()));
  const title = escapeHtml(file.meta.title);
  const description = escapeHtml(file.meta.description);
  const html = runtime
    .replace(/<title>[^<]*<\/title>/, () => `<title>${title}</title>`)
    .replace("</head>", () => `<meta name="description" content="${description}">\n</head>`)
    .replace(
      VIEWER_DATA_MARKER,
      () => `<script id="cloudy-board" type="application/octet-stream">${data}</script>`,
    );
  return new Blob([html], { type: "text/html" });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
