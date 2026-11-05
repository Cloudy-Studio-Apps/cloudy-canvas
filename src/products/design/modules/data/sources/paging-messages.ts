import type { PagingMessageKey } from "./paging-messages.types";

/**
 * What reading pages says, in English (engine text: agents get it as it is). `{name}` marks a
 * value; the Data tab reads a message back with `readPagingMessage` and shows it translated.
 */
const TEMPLATES: Record<PagingMessageKey, string> = {
  firstOnly: "Showing only the first page. Update reads every page.",
  repeated:
    "Stopped after {pages} pages: the next page was a link already read. The rows so far were kept.",
  same: "Stopped after {pages} pages: the next page gave the same rows again, so the site may be ignoring the page setting. The rows so far were kept.",
  limit:
    "Stopped at the limit of {pages} pages; the site may have more. The rows so far were kept; raise the limit under Pages to read more.",
  notJson: "{url} didn't answer JSON, which reading in pages needs.",
  failed: "Stopped at page {page}: {message} The rows read before it were kept.",
  otherSite:
    "Stopped after {pages} pages: the next page is on another site, and your keys are never sent there. The rows so far were kept.",
  noNextPath: "Say where the answer holds the link to the next page (Pages tab).",
};

/** A paging message with its values filled in. */
export function pagingMessage(
  key: PagingMessageKey,
  values: Record<string, string | number> = {},
): string {
  return TEMPLATES[key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
}

const READERS = (Object.keys(TEMPLATES) as PagingMessageKey[]).map((key) => {
  const names: string[] = [];
  const source = TEMPLATES[key]
    .split(/(\{\w+\})/)
    .map((part) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      if (!name) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      names.push(name);
      return "([\\s\\S]+?)";
    })
    .join("");
  return { key, names, pattern: new RegExp(`^${source}$`) };
});

/** The key and values of a message `pagingMessage` made, or `null` for any other message. */
export function readPagingMessage(
  message: string,
): { key: PagingMessageKey; values: Record<string, string> } | null {
  for (const { key, names, pattern } of READERS) {
    const match = pattern.exec(message);
    if (!match) continue;
    const values: Record<string, string> = {};
    names.forEach((name, i) => (values[name] = match[i + 1] ?? ""));
    return { key, values };
  }
  return null;
}
