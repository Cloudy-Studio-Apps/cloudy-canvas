/**
 * The parts of Figma's `NodeChange` the importer reads. Every field is optional: a node only
 * carries what differs from Figma's defaults, and an override carries only what it changes.
 */
export interface FigGuid {
  sessionID: number;
  localID: number;
}

export interface FigVector {
  x: number;
  y: number;
}

/** A 2×3 affine transform, relative to the parent. */
export interface FigMatrix {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
}

export interface FigColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigPaint {
  type?: string;
  color?: FigColor;
  opacity?: number;
  visible?: boolean;
  stops?: { color?: FigColor; position?: number }[];
  image?: { hash?: Uint8Array };
  imageThumbnail?: { hash?: Uint8Array };
  imageScaleMode?: string;
}

/** A path of `fillGeometry`/`strokeGeometry`: its commands live in a blob. */
export interface FigPath {
  windingRule?: string;
  commandsBlob?: number;
}

/** Figma's line height and letter spacing: a value and its unit. */
export interface FigNumber {
  value?: number;
  units?: string;
}

export interface FigTextData {
  characters?: string;
  styleOverrideTable?: unknown[];
}

/** A node in an instance's component, by the guids leading to it (nested instances first). */
export interface FigGuidPath {
  guids?: FigGuid[];
}

/** Fields an instance changes on a node of its component, or their resolved layout. */
export type FigOverride = FigNode & { guidPath?: FigGuidPath };

export interface FigPropRef {
  defID?: FigGuid;
  componentPropNodeField?: string;
}

export interface FigPropAssignment {
  defID?: FigGuid;
  value?: { textValue?: FigTextData; boolValue?: boolean };
}

export interface FigSymbolData {
  symbolID?: FigGuid;
  symbolOverrides?: FigOverride[];
}

export interface FigNode {
  guid?: FigGuid;
  phase?: string;
  type?: string;
  name?: string;
  parentIndex?: { guid?: FigGuid; position?: string };
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  internalOnly?: boolean;
  isPageDivider?: boolean;
  size?: FigVector;
  transform?: FigMatrix;
  fillPaints?: FigPaint[];
  strokePaints?: FigPaint[];
  strokeWeight?: number;
  strokeCap?: string;
  effects?: unknown[];
  fillGeometry?: FigPath[];
  strokeGeometry?: FigPath[];
  cornerRadius?: number;
  rectangleCornerRadiiIndependent?: boolean;
  rectangleTopLeftCornerRadius?: number;
  rectangleTopRightCornerRadius?: number;
  rectangleBottomLeftCornerRadius?: number;
  rectangleBottomRightCornerRadius?: number;
  frameMaskDisabled?: boolean;
  resizeToFit?: boolean;
  count?: number;
  starInnerScale?: number;
  vectorData?: { vectorNetworkBlob?: number; normalizedSize?: FigVector };
  textData?: FigTextData;
  fontSize?: number;
  fontName?: { family?: string; style?: string };
  lineHeight?: FigNumber;
  letterSpacing?: FigNumber;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  textAutoResize?: string;
  textCase?: string;
  autoRename?: boolean;
  symbolData?: FigSymbolData;
  derivedSymbolData?: FigOverride[];
  overriddenSymbolID?: FigGuid;
  componentPropRefs?: FigPropRef[];
  componentPropAssignments?: FigPropAssignment[];
}

/** A node with its children, instances expanded into their component's (overridden) nodes. */
export interface ResolvedFigNode {
  node: FigNode;
  children: ResolvedFigNode[];
}
