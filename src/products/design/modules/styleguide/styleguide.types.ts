import type {
  CanvasDocument,
  DocumentMeta,
  ModeContext,
  ResolvedValue,
  StyleRecord,
  TokenStore,
  ToolArgs,
  VariableRecord,
} from "@canvas";

/** A variable or a style a sheet shows. */
export type SheetItem =
  { kind: "variable"; record: VariableRecord } | { kind: "style"; record: StyleRecord };

/** One group of a category: a subsection of its sheet, with its own template. */
export interface SheetGroup {
  /** Stable across renames of other groups: `<collection id>/<group path>` or `styles/<path>`. */
  id: string;
  /** Its title (`""`: none, for a category's only, ungrouped group). */
  title: string;
  items: SheetItem[];
}

/**
 * A section of the Design system (Colors, Typography, …): which tokens it takes, as groups. Built-ins
 * and plugins contribute them to `styleguideCategories`.
 */
export interface StyleguideCategory {
  id: string;
  label: string;
  /** Position in the view, lowest first; built-ins are 10…100. */
  order: number;
  /** Its groups; none means the category is empty and isn't shown. */
  groups(store: TokenStore, doc: CanvasDocument): SheetGroup[];
  /** The template its groups use unless one is picked. */
  defaultTemplate: string;
  /** No heading of its own (the cover). */
  untitled?: boolean;
}

/** A template option, shown in the sidebar and stored with the choice. */
export type TemplateOptionSpec =
  | { id: string; label: string; type: "boolean"; default: boolean }
  | {
      id: string;
      label: string;
      type: "number";
      default: number;
      min: number;
      max: number;
      step?: number;
    }
  | {
      id: string;
      label: string;
      type: "select";
      default: string;
      choices: readonly { value: string; label: string }[];
    }
  | { id: string; label: string; type: "font"; default: string };

/** Template options with their values (every declared option is set). */
export type TemplateOptions = Readonly<Record<string, unknown>>;

/**
 * How one group of a category is drawn: a pure function from its tokens to the layers it's made
 * of. Built-ins and plugins contribute them to `styleguideTemplates`.
 */
export interface StyleguideTemplate {
  id: string;
  /** The category it draws. */
  category: string;
  label: string;
  description: string;
  options: readonly TemplateOptionSpec[];
  /** The group's body (see the spec builders). Pure: the same input gives the same specs. */
  build(group: SheetGroup, options: TemplateOptions, context: SheetBuildContext): GeneratedSpec[];
}

/** What a template builds with. */
export interface SheetBuildContext {
  store: TokenStore;
  meta: DocumentMeta;
  /** The local date (`YYYY-MM-DD`), so templates stay pure; a cover changes once a day at most. */
  today: string;
  /** The modes the layers being built are in (the sheet's, plus a mode column's). */
  modes: ModeContext;
  /** A variable's (or style's) value in those modes; `null` when it can't be resolved. */
  resolve(id: string): ResolvedValue | null;
  /** A variable's full name (`Collection/group/name`), or a style's name. */
  pathOf(record: VariableRecord | StyleRecord): string;
}

/**
 * A layer a sheet generates: an agent's `create_nodes` spec (built through the kinds) with the
 * variables it's bound to and its children.
 */
export interface GeneratedSpec {
  /** Unique within the sheet: regenerating matches layers by it. */
  key: string;
  args: ToolArgs;
  /** Field path → variable or style id. */
  bindings?: Record<string, string>;
  /** The modes it picks (a mode column), by axis id. */
  variableModes?: Record<string, string>;
  children?: GeneratedSpec[];
}
