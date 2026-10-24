/** A sticker's picture file, from its URL (a data URL, a bundled asset or an object URL). */
export async function fetchStickerBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`The sticker's picture couldn't be loaded (${response.status}).`);
  return new Uint8Array(await response.arrayBuffer());
}
