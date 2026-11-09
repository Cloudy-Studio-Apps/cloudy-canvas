/** Whether `url` is an `http:` or `https:` address, the only ones a prototype's links open. */
export function isWebAddress(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
