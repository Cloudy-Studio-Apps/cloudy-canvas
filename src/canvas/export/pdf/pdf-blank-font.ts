/**
 * A TrueType font with two empty glyphs, base64: all the hidden text layer needs, since it's never
 * drawn. Made once with fontTools (two glyphs 500 wide, only the tables a PDF reads).
 */
const BLANK_FONT =
  "AAEAAAAGAEAAAgAgZ2x5ZgAAAAAAAAD4AAAAAWhlYWQtMDm2AAAAbAAAADZoaGVhA+kB9gAAAKQAAAAkaG10eAH0AAAAAADoAAAABmxvY2EAAAAAAAAA8AAAAAZtYXhwAAMAAgAAAMgAAAAgAAEAAAABAADRDqJbXw889QADA+gAAAAA5wz8awAAAADnDPxrAAAAAAAAAAAAAAADAAIAAAAAAAAAAQAAA+gAAAAAAfQAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAQAAAAIAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAH0AAAAAAAAAAAAAAAAAAAAAAAA";

export function blankFontBytes(): Uint8Array {
  return Uint8Array.from(atob(BLANK_FONT), (char) => char.charCodeAt(0));
}
