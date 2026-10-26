import type {
  CvdKind,
  FillRef,
  HarmonyId,
  ImageMood,
  ImportedColor,
  ThemeMode,
  ThemeOverrides,
  WizardOptions,
  WizardResult,
  WizardRole,
  WizardType,
} from "../..";

/** The wizard's steps, in order. */
export type WizardStep = "colors" | "roles" | "theme" | "type" | "review";

/** Where step 1 takes its colors from. */
export type SourceTab = "wheel" | "brand" | "image" | "file" | "gallery" | "import";

/** A color of the palette being built. */
export interface PaletteColor {
  hex: string;
  /** Kept when generating (random, a harmony, an image). */
  locked: boolean;
  /** A role it came with (from a brand color, an import, an existing system). */
  name?: string;
  /** The layers' paints it was collected from. */
  fills?: FillRef[];
}

/** The sample design the review previews the theme on. */
export type PreviewKind = "website" | "components" | "social" | "brochure" | "mobile";

export interface ColorWizardState {
  open: boolean;
  step: WizardStep;
  /** What the last Create wrote (the done screen), `null` before. */
  created: WizardResult | null;
  tab: SourceTab;
  palette: PaletteColor[];
  past: PaletteColor[][];
  future: PaletteColor[][];
  harmony: HarmonyId;
  /** The wheel's brightness (HSV value, 0–1). */
  brightness: number;
  cvd: CvdKind;
  collection: string;
  gallery: { category: string; pages: number };
  /** The gallery palette used last (its colors joined), to mark its card. */
  picked: string | null;
  image: {
    /** The file's image picked, or `null` for one chosen from disk (`upload`, an object URL). */
    assetId: string | null;
    upload: string | null;
    mood: ImageMood;
    /** Where each color was found (0–1 of the image). */
    pins: { x: number; y: number }[];
    /** What the pins were found in (image and mood), to find them again when it changes. */
    readFrom: string | null;
  };
  brand: { colors: string[]; harmony: HarmonyId };
  fileMerge: number;
  /** The merged fills picked (their colors); `null`: the most used ones. */
  fileSelection: string[] | null;
  bindFills: boolean;
  importText: string;
  imported: ImportedColor[];
  /** The palette's roles, made from it on the roles step (empty while the palette changes). */
  roles: WizardRole[];
  options: WizardOptions;
  overrides: ThemeOverrides;
  themeSelection: { name: string; mode: ThemeMode };
  themeView: "visual" | "list";
  type: WizardType & { enabled: boolean };
  preview: { kind: PreviewKind; mode: ThemeMode };
  /** Bumps on Create, replaying the confetti. */
  celebration: number;
  set: (patch: Partial<ColorWizardState>) => void;
}
