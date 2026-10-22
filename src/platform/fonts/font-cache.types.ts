/** Files kept between sessions (desktop: the app data folder; the browser: nothing). */
export interface FontCache {
  readText(name: string): Promise<string | null>;
  writeText(name: string, text: string): Promise<void>;
  readBytes(name: string): Promise<Uint8Array | null>;
  writeBytes(name: string, data: Uint8Array): Promise<void>;
}

/** An installed face, as the Rust side lists it. */
export interface SystemFont {
  family: string;
  weight: number;
  italic: boolean;
}
