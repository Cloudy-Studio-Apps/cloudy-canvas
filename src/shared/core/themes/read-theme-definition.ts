import { isThemeToken } from "./theme-tokens";
import type {
  ReadThemeResult,
  ThemeCorners,
  ThemeDensity,
  ThemeFonts,
  ThemeTokens,
} from "./theme.types";

const ID = /^[a-z0-9][a-z0-9-]*$/;
const DENSITIES: readonly ThemeDensity[] = ["compact", "default", "comfortable"];
/** Characters that could end a declaration or the style sheet: never in a value. */
const UNSAFE_VALUE = /[;{}<>\\]/;

/**
 * A theme from a plugin, checked field by field. Unknown tokens are left out and listed in
 * `ignored`. Throws with a message for the plugin's author when something required is wrong.
 */
export function readThemeDefinition(data: unknown): ReadThemeResult {
  if (typeof data !== "object" || data === null) throw new Error("A theme must be an object.");
  const t = data as Record<string, unknown>;
  if (typeof t.id !== "string" || !ID.test(t.id)) {
    throw new Error("A theme needs an id of lowercase letters, digits and dashes.");
  }
  const where = `The theme "${t.id}"`;
  if (typeof t.label !== "string" || !t.label) throw new Error(`${where} needs a label.`);
  if (t.appearance !== "light" && t.appearance !== "dark") {
    throw new Error(`${where} needs an appearance: "light" or "dark".`);
  }
  if (t.extends !== undefined && typeof t.extends !== "string") {
    throw new Error(`${where}: "extends" must be a theme id.`);
  }
  if (t.density !== undefined && !DENSITIES.includes(t.density as ThemeDensity)) {
    throw new Error(`${where}: "density" must be compact, default or comfortable.`);
  }

  const ignored: string[] = [];
  const tokens = readTokens(t.tokens ?? {}, where, ignored);
  const products: Record<string, ThemeTokens> = {};
  if (t.products !== undefined) {
    if (typeof t.products !== "object" || t.products === null) {
      throw new Error(`${where}: "products" must map product ids to tokens.`);
    }
    for (const [product, values] of Object.entries(t.products)) {
      products[product] = readTokens(values, `${where} (${product})`, ignored);
    }
  }
  const preview = t.preview as Record<string, unknown> | undefined;
  const previewColor = (key: string, fallback: string | undefined) => {
    const value = preview?.[key] ?? fallback;
    if (typeof value !== "string" || UNSAFE_VALUE.test(value)) {
      throw new Error(`${where} needs preview.${key} (or the matching token).`);
    }
    return value;
  };

  return {
    theme: {
      id: t.id,
      label: t.label,
      appearance: t.appearance,
      ...(typeof t.description === "string" ? { description: t.description } : {}),
      ...(typeof t.family === "string" && t.family.trim() ? { family: t.family.trim() } : {}),
      ...(typeof t.extends === "string" ? { extends: t.extends } : {}),
      tokens,
      products,
      ...(t.fonts ? { fonts: readFonts(t.fonts, where) } : {}),
      ...(t.density ? { density: t.density as ThemeDensity } : {}),
      ...(t.corners ? { corners: readCorners(t.corners, where) } : {}),
      preview: {
        background: previewColor("background", tokens.background),
        surface: previewColor("surface", tokens.surface),
        primary: previewColor("primary", tokens.primary),
        foreground: previewColor("foreground", tokens.foreground),
      },
    },
    ignored,
  };
}

function readTokens(data: unknown, where: string, ignored: string[]): ThemeTokens {
  if (typeof data !== "object" || data === null)
    throw new Error(`${where}: tokens must be an object.`);
  const tokens: ThemeTokens = {};
  for (const [name, value] of Object.entries(data)) {
    if (!isThemeToken(name)) {
      ignored.push(name);
      continue;
    }
    if (typeof value !== "string" || !value.trim() || UNSAFE_VALUE.test(value)) {
      throw new Error(`${where}: the token "${name}" needs a CSS value.`);
    }
    tokens[name] = value;
  }
  return tokens;
}

function readFonts(data: unknown, where: string): ThemeFonts {
  const fonts = data as Record<string, unknown>;
  const read = (key: "sans" | "mono") => {
    const value = fonts[key];
    if (value === undefined) return {};
    if (typeof value !== "string" || UNSAFE_VALUE.test(value)) {
      throw new Error(`${where}: fonts.${key} must be a font stack.`);
    }
    return { [key]: value };
  };
  return { ...read("sans"), ...read("mono") };
}

function readCorners(data: unknown, where: string): ThemeCorners {
  const corners = data as Record<string, unknown>;
  const result: ThemeCorners = {};
  for (const key of ["control", "card", "max"] as const) {
    const value = corners[key];
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`${where}: corners.${key} must be a number of px.`);
    }
    result[key] = value;
  }
  return result;
}
