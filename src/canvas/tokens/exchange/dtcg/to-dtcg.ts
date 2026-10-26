import { DEFAULT_VALUE } from "../../default-value";
import type { TokenStore } from "../../token-store";
import type { StyleRecord, TokenValue, VariableRecord } from "../../token.types";
import { uniqueNames } from "../token-names";
import type {
  DtcgObject as Group,
  DtcgOptions,
  DtcgRootExtension,
  DtcgStyleExtension,
  DtcgTokenExtension,
} from "./dtcg.types";
import { DTCG_EXTENSION, PX_SCOPES, dtcgColor, dtcgDimension, dtcgSegment } from "./dtcg-values";

/**
 * The file's variables and styles as W3C Design Tokens (DTCG) JSON: a root group per collection,
 * groups by path, aliases as `{Collection.path}` references, styles a codec writes in a `Styles`
 * group; modes, ids, scopes and what DTCG has no place for in `$extensions["app.cloudy-canvas"]`,
 * so reading it back is exact.
 */
export function toDtcg(store: TokenStore, options: DtcgOptions = {}): Record<string, unknown> {
  const root: Group = {};
  const collections = store.collections();
  const roots = uniqueNames([...collections.map((c) => dtcgSegment(c.name)), "Styles"], " ");
  const rootOf = new Map(collections.map((c, i) => [c.id, roots[i] ?? c.name]));
  const pathOf = (v: VariableRecord) =>
    [rootOf.get(v.collectionId) ?? "?", ...v.name.split("/").map(dtcgSegment)].join(".");
  const ref = (id: string) => {
    const target = store.variable(id);
    return target ? `{${pathOf(target)}}` : null;
  };

  for (const v of store.variables()) {
    const segments = pathOf(v).split(".");
    placeToken(root, segments, variableToken(store, v, ref));
  }

  const stylesGroup = roots.at(-1) ?? "Styles";
  const loose: DtcgStyleExtension[] = [];
  for (const style of store.styles()) {
    const ext = styleExtension(style, ref);
    const codec = options.styles?.find((c) => c.styleType === style.styleType);
    const value = codec?.write(style, ref) ?? null;
    if (!codec || value === null) {
      loose.push(ext);
      continue;
    }
    const segments = [
      stylesGroup,
      dtcgSegment(codec.group),
      ...style.name.split("/").map(dtcgSegment),
    ];
    placeToken(root, segments, {
      $type: codec.dtcgType,
      $value: value,
      ...(style.description ? { $description: style.description } : {}),
      $extensions: { [DTCG_EXTENSION]: ext },
    });
  }

  const ext: DtcgRootExtension = {
    version: 1,
    axes: store
      .axes()
      .map((a) => ({ id: a.id, name: a.name, modes: a.modes.map((m) => ({ ...m })) })),
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      group: rootOf.get(c.id) ?? c.name,
    })),
    ...(store.styles().length > loose.length ? { stylesGroup } : {}),
    ...(loose.length > 0 ? { styles: loose } : {}),
  };
  return { ...root, $extensions: { [DTCG_EXTENSION]: ext } };
}

function variableToken(
  store: TokenStore,
  v: VariableRecord,
  ref: (id: string) => string | null,
): Record<string, unknown> {
  const write = (value: TokenValue) => tokenValue(v, value, ref);
  const axis = v.axisId ? store.axis(v.axisId) : undefined;
  const modes: Record<string, unknown> = {};
  for (const mode of axis?.modes.slice(1) ?? []) {
    const value = v.values[mode.id];
    if (value) modes[mode.name] = write(value);
  }
  const written = v.name.split("/").map(dtcgSegment).join("/");
  const ext: DtcgTokenExtension = {
    id: v.id,
    ...(written !== v.name ? { name: v.name } : {}),
    ...(axis ? { axis: axis.name } : {}),
    ...(Object.keys(modes).length > 0 ? { modes } : {}),
    scopes: [...v.scopes],
    hidden: v.hidden,
    codeSyntax: { ...v.codeSyntax },
    ...(v.contrastWith?.length
      ? { contrastWith: v.contrastWith.flatMap((id) => ref(id) ?? []) }
      : {}),
  };
  const base = v.values[DEFAULT_VALUE];
  return {
    $type: dtcgType(v),
    $value: base ? write(base) : null,
    ...(v.description ? { $description: v.description } : {}),
    $extensions: { [DTCG_EXTENSION]: ext },
  };
}

function dtcgType(v: VariableRecord): string {
  if (v.type === "color") return "color";
  if (v.type === "boolean") return "boolean";
  if (v.type === "string") return v.scopes.includes("font-family") ? "fontFamily" : "string";
  return v.scopes.some((s) => PX_SCOPES.has(s)) ? "dimension" : "number";
}

function tokenValue(
  v: VariableRecord,
  value: TokenValue,
  ref: (id: string) => string | null,
): unknown {
  if ("alias" in value) return ref(value.alias);
  if ("color" in value) return dtcgColor(value.color);
  if ("number" in value)
    return dtcgType(v) === "dimension" ? dtcgDimension(value.number) : value.number;
  if ("string" in value) return value.string;
  return value.boolean;
}

function styleExtension(
  style: StyleRecord,
  ref: (id: string) => string | null,
): DtcgStyleExtension {
  const bindings: Record<string, string> = {};
  for (const [path, id] of Object.entries(style.bindings ?? {})) {
    const reference = ref(id);
    if (reference) bindings[path] = reference;
  }
  return {
    id: style.id,
    styleType: style.styleType,
    name: style.name,
    value: structuredClone(style.value),
    bindings,
    description: style.description,
  };
}

/** Puts a token at a path of groups, making the groups. */
function placeToken(
  root: Group,
  segments: readonly string[],
  token: Record<string, unknown>,
): void {
  let group = root;
  for (const segment of segments.slice(0, -1)) {
    const next = group[segment];
    if (typeof next === "object" && next !== null) group = next as Group;
    else {
      const made: Group = {};
      group[segment] = made;
      group = made;
    }
  }
  const leaf = segments.at(-1) ?? "_";
  const existing = group[leaf];
  // A token named like a group (`teal` and `teal/100`) keeps the group's tokens beside it.
  group[leaf] =
    typeof existing === "object" && existing !== null ? { ...existing, ...token } : token;
}
