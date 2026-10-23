/** The first line of release notes with its Markdown marks left out, or `null` when there's none. */
export function firstLine(notes: string | null): string | null {
  const line = notes
    ?.split("\n")
    .map((text) => text.replace(/^[#>*\-\s]+/, "").trim())
    .find((text) => text.length > 0);
  return line ?? null;
}
