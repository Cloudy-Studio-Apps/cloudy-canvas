import {
  DOCUMENT_TOKENS,
  optionalBoolean,
  optionalChoice,
  optionalNumber,
  optionalRecord,
  optionalString,
  recordList,
  stringArg,
  type ToolArgs,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../mcp";
import { normalizeColorHex } from "./color";
import { applyWizard, buildWizardPlan, type WizardInput } from "./plan";
import {
  buildTheme,
  cleanRoleName,
  contrastResults,
  cvdWarnings,
  fixAllContrast,
  type ThemeChoice,
  type ThemeMode,
  type ThemeOverrides,
  wizardColors,
} from "./theme";
import { DEFAULT_WIZARD_TYPE, type WizardType } from "./type";

const MODES: readonly ThemeMode[] = ["Light", "Dark"];

function readColors(args: ToolArgs): WizardInput["roles"] {
  return recordList(args, "colors").map((c, i) => {
    const hex = normalizeColorHex(stringArg(c, "hex"));
    if (!hex) throw new Error(`colors[${i}].hex must be a color like "#3A83C9".`);
    return { name: cleanRoleName(stringArg(c, "role")), hex, include: true };
  });
}

function readOverrides(args: ToolArgs): ThemeOverrides {
  const record = optionalRecord(args, "overrides") ?? {};
  const out: ThemeOverrides = {};
  for (const token of Object.keys(record)) {
    const perMode = optionalRecord(record, token) ?? {};
    for (const mode of Object.keys(perMode)) {
      if (!MODES.includes(mode as ThemeMode)) {
        throw new Error(`overrides.${token}: "${mode}" is Light or Dark.`);
      }
      const choice = optionalRecord(perMode, mode) ?? {};
      const hex = optionalString(choice, "hex");
      const picked: ThemeChoice = {
        role: optionalString(choice, "role"),
        stop: optionalNumber(choice, "stop"),
        hex: hex ? (normalizeColorHex(hex) ?? undefined) : undefined,
      };
      if (picked.role === "custom" && !picked.hex) {
        throw new Error(`overrides.${token}.${mode}: a custom color needs "hex".`);
      }
      out[token] = { ...out[token], [mode]: picked };
    }
  }
  return out;
}

function readType(args: ToolArgs): WizardType | null {
  const type = optionalRecord(args, "textStyles");
  if (!type) return null;
  return {
    heading: optionalString(type, "heading") ?? DEFAULT_WIZARD_TYPE.heading,
    body: optionalString(type, "body") ?? DEFAULT_WIZARD_TYPE.body,
    base: optionalNumber(type, "base") ?? DEFAULT_WIZARD_TYPE.base,
    ratio: optionalNumber(type, "ratio") ?? DEFAULT_WIZARD_TYPE.ratio,
  };
}

/** The color wizard as one tool: what the wizard's UI makes, from a list of colors. */
export const colorWizardTools: DesignMcpTool[] = [
  {
    name: "run_color_wizard",
    description:
      "Sets up a design system from a few colors, as the Design system's color wizard does, in " +
      "one undo step: each color's 50–950 shades as a shade generator in the palette collection " +
      "(the color at 500; an existing group is updated), an optional tinted neutral and status " +
      "colors (success, warning, error, info), a Theme collection whose tokens (background, " +
      "surface, foreground, muted-foreground, border, primary, primary-foreground, primary-soft, " +
      "accent, the status colors) alias the shades per mode (Light/Dark), and optional text " +
      "styles (a type scale in a heading and a body font). `fixContrast` (default true) moves " +
      "tokens to the nearest shades that pass WCAG AA. `preview: true` only returns the plan.",
    inputSchema: {
      type: "object",
      required: ["colors"],
      properties: {
        collection: {
          type: "string",
          description: 'The palette\'s collection; "Brand" by default.',
        },
        colors: {
          type: "array",
          description: 'Each { role: "primary", hex: "#3A83C9" }; "neutral" is the gray.',
          items: {
            type: "object",
            required: ["role", "hex"],
            properties: { role: { type: "string" }, hex: { type: "string" } },
          },
        },
        shades: { type: "boolean", description: "50–950 shades per color (default true)." },
        neutral: { type: "boolean", description: "Add a tinted neutral (default true)." },
        status: { type: "boolean", description: "Add status colors (default true)." },
        theme: { type: "boolean", description: "Make the Theme collection (default true)." },
        modes: { type: "string", enum: ["both", "light", "dark"] },
        overrides: {
          type: "object",
          description:
            'Token → mode → { role, stop } (a palette role and shade), { role: "white" | "black" | "auto" } or { role: "custom", hex }.',
        },
        fixContrast: { type: "boolean" },
        textStyles: {
          type: "object",
          description: "{ heading, body, base (px), ratio }: text styles; left out, none.",
        },
        preview: { type: "boolean" },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const options = {
        shades: optionalBoolean(args, "shades") ?? true,
        neutral: optionalBoolean(args, "neutral") ?? true,
        status: optionalBoolean(args, "status") ?? true,
        theme: optionalBoolean(args, "theme") ?? true,
        modes: optionalChoice(args, "modes", ["both", "light", "dark"] as const) ?? "both",
      };
      const roles = readColors(args);
      let overrides = readOverrides(args);
      if (optionalBoolean(args, "fixContrast") ?? true) {
        overrides = fixAllContrast(wizardColors(roles, options), options, overrides).overrides;
      }
      const input: WizardInput = {
        collection: optionalString(args, "collection") ?? "Brand",
        roles,
        options,
        overrides,
        type: readType(args),
        bindFills: false,
      };
      const theme = buildTheme(wizardColors(roles, options), options, overrides);
      const checks = contrastResults(theme).map((r) => ({
        pair: `${r.fg} on ${r.bg}`,
        mode: r.mode,
        ratio: Math.round(r.ratio * 100) / 100,
        pass: r.pass,
      }));
      const lookAlike = cvdWarnings(theme).map((w) => ({
        roles: [w.a, w.b],
        to: w.everyone ? "everyone" : w.kinds,
      }));
      if (optionalBoolean(args, "preview")) {
        const plan = buildWizardPlan(tokens.store(), input);
        return {
          collections: plan.collections.map((c) => ({
            name: c.name,
            modes: c.modes,
            variables: c.variables.map((v) => ({
              name: v.name,
              values: v.aliases,
              action: v.action,
            })),
          })),
          textStyles: plan.textStyles.map((s) => `Type/${s.name}`),
          contrast: checks,
          lookAlike,
        };
      }
      return { ...applyWizard(engine.doc, tokens, input), contrast: checks, lookAlike };
    },
  },
];
