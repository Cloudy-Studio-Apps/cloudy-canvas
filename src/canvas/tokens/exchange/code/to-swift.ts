import type { CodeTokens, CodeValue, CodeVariable } from "./code-tokens.types";
import {
  axisOf,
  formatNumber,
  nativeGroup,
  rgba,
  safeIdentifier,
  valuesByMode,
} from "./native-values";

const GROUPS = {
  colors: "Colors",
  numbers: "Numbers",
  strings: "Strings",
  flags: "Flags",
} as const;
const TYPES = { colors: "Color", numbers: "CGFloat", strings: "String", flags: "Bool" } as const;

/**
 * SwiftUI: `enum Tokens` with `Colors`, `Numbers` (CGFloat), `Strings`, `Flags`, `TextStyles`
 * (`Font`) and `Shadows`; a variable that changes with a mode is a function of that axis's enum.
 */
export function toSwift(tokens: CodeTokens): string {
  const out = [`// ${tokens.title}: design tokens from Cloudy Canvas`, "import SwiftUI", ""];
  for (const axis of tokens.axes) {
    if (!tokens.variables.some((v) => axisOf(tokens, v)?.id === axis.id)) continue;
    out.push(`enum ${axis.typeName}: CaseIterable {`);
    for (const mode of axis.modes) out.push(`    case ${safeIdentifier(mode.caseName)}`);
    out.push("}", "");
  }
  out.push("enum Tokens {");
  for (const group of ["colors", "numbers", "strings", "flags"] as const) {
    const members = tokens.variables.filter((v) => nativeGroup(v) === group);
    if (members.length === 0) continue;
    out.push(`    enum ${GROUPS[group]} {`);
    for (const v of members) out.push(...member(tokens, v, TYPES[group]));
    out.push("    }");
  }
  if (tokens.textStyles.length > 0) {
    out.push("    enum TextStyles {");
    for (const t of tokens.textStyles) {
      out.push(
        `        /// ${t.path}: ${t.family} ${formatNumber(t.size)}, line height ×${formatNumber(t.lineHeight)}`,
        `        static let ${safeIdentifier(t.swiftName)} = Font.custom(${JSON.stringify(t.family)}, size: ${formatNumber(t.size)}).weight(${swiftWeight(t.weight)})`,
      );
    }
    out.push("    }");
  }
  if (tokens.shadows.length > 0) {
    out.push("    enum Shadows {");
    for (const s of tokens.shadows) {
      const top = s.layers.at(-1);
      if (!top) continue;
      out.push(
        `        /// ${s.path}`,
        `        static let ${safeIdentifier(s.swiftName)} = (color: ${swiftValue(top.color, "colors")}, radius: CGFloat(${formatNumber(top.blur / 2)}), x: CGFloat(${formatNumber(top.x)}), y: CGFloat(${formatNumber(top.y)}))`,
      );
    }
    out.push("    }");
  }
  out.push("}", "");
  return out.join("\n");
}

function member(tokens: CodeTokens, v: CodeVariable, type: string): string[] {
  const group = nativeGroup(v);
  const name = safeIdentifier(v.swiftName);
  const axis = axisOf(tokens, v);
  if (!axis) return [`        static let ${name}: ${type} = ${swiftValue(v.base, group)}`];
  const param = axis.typeName.charAt(0).toLowerCase() + axis.typeName.slice(1);
  return [
    `        static func ${name}(_ ${param}: ${axis.typeName}) -> ${type} {`,
    `            switch ${param} {`,
    ...valuesByMode(axis, v).map(
      ({ mode, value }) =>
        `            case .${safeIdentifier(mode.caseName)}: return ${swiftValue(value, group)}`,
    ),
    "            }",
    "        }",
  ];
}

function swiftValue(value: CodeValue, group: ReturnType<typeof nativeGroup>): string {
  if (group === "colors" && typeof value === "string") {
    const c = rgba(value);
    return `Color(red: ${formatNumber(c.r)}, green: ${formatNumber(c.g)}, blue: ${formatNumber(c.b)}, opacity: ${formatNumber(c.a)})`;
  }
  if (typeof value === "number") return formatNumber(value);
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

function swiftWeight(weight: number): string {
  const names: Record<number, string> = {
    100: ".ultraLight",
    200: ".thin",
    300: ".light",
    400: ".regular",
    500: ".medium",
    600: ".semibold",
    700: ".bold",
    800: ".heavy",
    900: ".black",
  };
  return names[Math.round(weight / 100) * 100] ?? ".regular";
}
