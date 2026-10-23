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

/**
 * Where a node placed by a matrix lands as a box turned round its corner: `x`, `y` its corner,
 * `w`×`h` its scaled size, `rotation` degrees counterclockwise (a design layer's fields).
 */
export interface FigPlacement {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

/**
 * One of a node's effects as the file has it (shadows and blurs; newer files may carry others,
 * read field by field since their names aren't fixed).
 */
export interface FigEffect {
  type?: string;
  visible?: boolean;
  color?: FigColor;
  offset?: FigVector;
  radius?: number;
  spread?: number;
  showShadowBehindNode?: boolean;
  /** `PROGRESSIVE` for a progressive blur. */
  blurOpType?: string;
  startRadius?: number;
  startOffset?: FigVector;
  endOffset?: FigVector;
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
  /**
   * A gradient's placement (Figma's `gradientTransform`) or a cropped image's (`imageTransform`,
   * `imageScaleMode` STRETCH), from the layer's 0–1 box.
   */
  transform?: FigMatrix;
  image?: { hash?: Uint8Array };
  imageThumbnail?: { hash?: Uint8Array };
  /** FILL, FIT, STRETCH (a crop) or TILE. */
  imageScaleMode?: string;
  /** A tiled image's tile size, as a share of its pixel size (`scalingFactor`). */
  scale?: number;
  /** An image's quarter turns, in degrees. */
  rotation?: number;
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

/** One end of a FigJam connector: on a node (`position` in its coordinates) or free. */
export interface FigConnectorEnd {
  endpointNodeID?: FigGuid;
  position?: FigVector;
  /** The side it's stuck to: `TOP`, `BOTTOM`, `LEFT`, `RIGHT`, or `EDGE`/`CENTER`/`NONE`. */
  magnet?: string;
}

/** A wrapped text's laid-out lines: where each starts in its characters. */
export interface FigTextLayout {
  baselines?: { firstCharacter?: number; endCharacter?: number }[];
}

/** A shared style a node uses: a style in the file (`guid`) or from a library (`assetRef.key`). */
export interface FigStyleRef {
  guid?: FigGuid;
  assetRef?: { key?: string };
}

export interface FigNode {
  guid?: FigGuid;
  phase?: string;
  type?: string;
  /** A style's or component's library key. */
  key?: string;
  /** Set on style nodes: `TEXT`, `FILL`, `EFFECT` or `GRID`. */
  styleType?: string;
  /** The text style it uses, whose typography wins over its own fields. */
  styleIdForText?: FigStyleRef;
  /** The color style of its fills, whose paints win over its own. */
  styleIdForFill?: FigStyleRef;
  /** The color style of its strokes. */
  styleIdForStrokeFill?: FigStyleRef;
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
  /** `INSIDE`, `CENTER` or `OUTSIDE`. */
  strokeAlign?: string;
  strokeCap?: string;
  strokeJoin?: string;
  /** The longest miter, in stroke widths, before a corner is beveled. */
  miterLimit?: number;
  /** Dash, gap… lengths; empty or missing for a solid stroke. */
  dashPattern?: number[];
  /** Whether each side of a box has its own stroke weight (`border*Weight`). */
  borderStrokeWeightsIndependent?: boolean;
  borderTopWeight?: number;
  borderRightWeight?: number;
  borderBottomWeight?: number;
  borderLeftWeight?: number;
  effects?: FigEffect[];
  fillGeometry?: FigPath[];
  strokeGeometry?: FigPath[];
  cornerRadius?: number;
  rectangleCornerRadiiIndependent?: boolean;
  rectangleTopLeftCornerRadius?: number;
  rectangleTopRightCornerRadius?: number;
  rectangleBottomLeftCornerRadius?: number;
  rectangleBottomRightCornerRadius?: number;
  frameMaskDisabled?: boolean;
  /** Whether the layer is a mask of the siblings above it. */
  mask?: boolean;
  /** How it masks: `"ALPHA"`, `"OUTLINE"` (Figma's vector mask) or `"LUMINANCE"`. */
  maskType?: string;
  /** Older files' vector masks, before `maskType`. */
  maskIsOutline?: boolean;
  /** A boolean's operation: `"UNION"`, `"INTERSECT"`, `"SUBTRACT"` or `"XOR"`. */
  booleanOperation?: string;
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
  textDecoration?: string;
  paragraphSpacing?: number;
  autoRename?: boolean;
  symbolData?: FigSymbolData;
  derivedSymbolData?: FigOverride[];
  overriddenSymbolID?: FigGuid;
  componentPropRefs?: FigPropRef[];
  componentPropAssignments?: FigPropAssignment[];
  /** A page's ruler guides: `axis` `X` is a vertical line at x = `offset`. */
  guides?: { axis?: string; offset?: number }[];
  // FigJam
  /** A sticky's, shape's or connector's generated parts (its body, its text) and their looks. */
  nodeGenerationData?: { overrides?: FigOverride[] };
  derivedTextData?: FigTextLayout;
  /** A FigJam shape's outline: `SQUARE`, `ELLIPSE`, `DIAMOND`, `TRIANGLE_UP`, … */
  shapeWithTextType?: string;
  connectorStart?: FigConnectorEnd;
  connectorEnd?: FigConnectorEnd;
  /** `STRAIGHT`, `ELBOWED` or `CURVED`. */
  connectorLineStyle?: string;
  /** `NONE`, `ROUND`, `ARROW_LINES`, `ARROW_EQUILATERAL`, `TRIANGLE_FILLED`, … */
  connectorStartCap?: string;
  connectorEndCap?: string;
  /** A link preview widget's link (its fields are URL-encoded). */
  linkPreviewData?: { url?: string; title?: string };
  widgetMetadata?: { pluginID?: string; widgetName?: string };
}

/** A node with its children, instances expanded into their component's (overridden) nodes. */
export interface ResolvedFigNode {
  node: FigNode;
  children: ResolvedFigNode[];
}
