const hex = (unit: number) => unit.toString(16).toUpperCase().padStart(4, "0");

/**
 * A PDF text string (a bookmark's title) as UTF-16BE with its byte order mark, written in hex so
 * any language, emoji and PDF's own delimiters (`(`, `)`, `\`) need no escaping.
 */
export function pdfTextString(text: string): string {
  let units = "FEFF";
  for (let i = 0; i < text.length; i++) units += hex(text.charCodeAt(i));
  return `<${units}>`;
}
