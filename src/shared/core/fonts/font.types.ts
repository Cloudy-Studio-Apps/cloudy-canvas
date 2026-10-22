/** A CSS font weight, from thin (100) to black (900). */
export type FontWeight = "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export type FontStyle = "normal" | "italic";

/** One face of a family: its weight and style. */
export interface FontVariant {
  weight: FontWeight;
  style: FontStyle;
}

/** A face of a family, as text asks for it to be loaded. */
export interface FontRequest extends FontVariant {
  family: string;
}

/** Where a family comes from: installed on the computer, or downloaded from Google Fonts. */
export type FontSource = "installed" | "google";

/** A font family the picker offers. */
export interface FontFamily {
  family: string;
  source: FontSource;
  /** Google's category (`sans-serif`, `serif`, `display`, …), when known. */
  category?: string;
  /** Its faces, regular first when it has one. */
  variants: FontVariant[];
}

/**
 * Makes fonts usable by the canvas and the DOM (downloading them if needed). Implemented per
 * platform in `platform/`; resolves `false` when the font can't be had (text falls back).
 */
export interface FontLoader {
  load(request: FontRequest): Promise<boolean>;
}

/** The fonts the app offers: installed ones and the Google Fonts catalog. */
export interface FontLibrary extends FontLoader {
  /** Every family, installed first, then Google's; cached after the first call. */
  families(): Promise<FontFamily[]>;
}

/** One face file of a Google font, read from Google's CSS. */
export interface FontFaceSource {
  url: string;
  /** The CSS `unicode-range` it covers, when the CSS splits the face by script. */
  unicodeRange?: string;
}
