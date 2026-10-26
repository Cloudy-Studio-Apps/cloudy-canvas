import { resolveVariable } from "../../resolve-token";
import type { TokenStore } from "../../token-store";
import type {
  ModeContext,
  ResolvedValue,
  TokenScope,
  TokenValue,
  VariableRecord,
} from "../../token.types";
import { DEFAULT_VALUE } from "../../default-value";
import { PX_SCOPES } from "../dtcg/dtcg-values";
import { camelPath, slugPath, uniqueNames } from "../token-names";
import { namesFor } from "./code-names";
import type {
  CodeAxis,
  CodeModeValue,
  CodeStyles,
  CodeTokens,
  CodeUnit,
  CodeValue,
  CodeVariable,
} from "./code-tokens.types";

/**
 * The file's visible variables (and the styles `styles` gives) ready for the code writers: named
 * per platform (their code syntax when set), resolved in every axis's first mode, with the modes
 * where each differs (through its own value or an alias).
 */
export function codeTokens(
  store: TokenStore,
  title: string,
  styles?: (store: TokenStore, cssNameOf: (variableId: string) => string | null) => CodeStyles,
): CodeTokens {
  const variables = store.variables().filter((v) => !v.hidden);
  const items = variables.map((v) => ({
    path: v.name,
    collection: store.collection(v.collectionId)?.name ?? "",
  }));
  const css = namesFor(
    variables.map((v, i) => ({ ...(items[i] as (typeof items)[number]), own: webName(v) })),
    "slug",
  );
  const swift = namesFor(
    variables.map((v, i) => ({
      ...(items[i] as (typeof items)[number]),
      own: identifier(v.codeSyntax.ios),
    })),
    "camel",
  );
  const kotlin = namesFor(
    variables.map((v, i) => ({
      ...(items[i] as (typeof items)[number]),
      own: identifier(v.codeSyntax.android),
    })),
    "pascal",
  );
  const cssOf = new Map(variables.map((v, i) => [v.id, css[i] as string]));

  const axes: CodeAxis[] = store
    .axes()
    .filter((a) => a.modes.length > 1)
    .map((a, i, all) => {
      const typeNames = uniqueNames(
        all.map((x) => camelPath(x.name, true)),
        "",
      );
      const cases = uniqueNames(
        a.modes.map((m) => camelPath(m.name)),
        "",
      );
      return {
        id: a.id,
        name: a.name,
        slug: slugPath(a.name),
        typeName: typeNames[i] ?? "Mode",
        modes: a.modes.map((m, j) => ({
          id: m.id,
          name: m.name,
          slug: slugPath(m.name),
          caseName: cases[j] ?? "mode",
        })),
      };
    });
  const baseModes: ModeContext = Object.fromEntries(
    store.axes().flatMap((a) => (a.modes[0] ? [[a.id, a.modes[0].id]] : [])),
  );

  const out: CodeVariable[] = [];
  variables.forEach((v, i) => {
    const unit = unitOf(v.scopes);
    const base = codeValue(resolveVariable(store, v.id, baseModes), unit);
    if (base === null) return;
    const own = v.values[DEFAULT_VALUE];
    const modes: CodeModeValue[] = [];
    for (const axis of axes) {
      for (const mode of axis.modes.slice(1)) {
        const value = codeValue(
          resolveVariable(store, v.id, { ...baseModes, [axis.id]: mode.id }),
          unit,
        );
        const raw = v.axisId === axis.id ? v.values[mode.id] : undefined;
        // An alias of a variable code doesn't list (hidden) is written as its value.
        const target = raw && "alias" in raw ? cssOf.get(raw.alias) : undefined;
        const ownValue = raw
          ? target
            ? { alias: target }
            : "alias" in raw
              ? { value: value ?? "" }
              : { value: codeValue(rawResolved(raw), unit) ?? "" }
          : undefined;
        if (value !== null && (value !== base || ownValue)) {
          modes.push({
            axis: axis.id,
            mode: mode.id,
            value,
            ...(ownValue ? { own: ownValue } : {}),
          });
        }
      }
    }
    out.push({
      id: v.id,
      path: v.name,
      type: v.type,
      unit,
      cssName: css[i] as string,
      swiftName: swift[i] as string,
      kotlinName: kotlin[i] as string,
      base,
      ...(own && "alias" in own && cssOf.has(own.alias) ? { alias: cssOf.get(own.alias) } : {}),
      modes,
      scopes: v.scopes,
    });
  });
  const given = styles?.(store, (id) => cssOf.get(id) ?? null) ?? { textStyles: [], shadows: [] };
  return { title, axes, variables: out, ...given };
}

/** `--name` from a web code syntax like `var(--color-bg)`, else `null`. */
function webName(v: VariableRecord): string | null {
  const match = /--([A-Za-z0-9_-]+)/.exec(v.codeSyntax.web ?? "");
  return match?.[1] ?? null;
}

function identifier(name: string | undefined): string | null {
  return name && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : null;
}

function unitOf(scopes: readonly TokenScope[]): CodeUnit {
  if (scopes.includes("font-size")) return "font-size";
  if (scopes.some((s) => PX_SCOPES.has(s))) return "px";
  if (scopes.includes("opacity")) return "opacity";
  return "none";
}

function codeValue(value: ResolvedValue | null, unit: CodeUnit): CodeValue | null {
  if (!value || value.type === "style") return null;
  if (value.type === "color") return value.color;
  if (value.type === "number")
    return unit === "opacity" && value.number > 1 ? value.number / 100 : value.number;
  if (value.type === "string") return value.string;
  return value.boolean;
}

function rawResolved(raw: Exclude<TokenValue, { alias: string }>): ResolvedValue {
  if ("color" in raw) return { type: "color", color: raw.color };
  if ("number" in raw) return { type: "number", number: raw.number };
  if ("string" in raw) return { type: "string", string: raw.string };
  return { type: "boolean", boolean: raw.boolean };
}
