import type { CodeTokens, CodeValue, CodeVariable } from "./code-tokens.types";
import {
  argbHex,
  axisOf,
  formatNumber,
  nativeGroup,
  safeIdentifier,
  valuesByMode,
} from "./native-values";

const GROUPS = { colors: "Colors", numbers: "Dimens", strings: "Strings", flags: "Flags" } as const;

/**
 * Jetpack Compose: `object Tokens` with `Colors` (`Color(0xAARRGGBB)`), `Dimens` (`.dp`, `.sp`
 * for font sizes, plain floats otherwise), `Strings`, `Flags` and `TextStyles`; a variable that
 * changes with a mode is a function of that axis's enum.
 */
export function toKotlin(tokens: CodeTokens): string {
  const out = [
    `// ${tokens.title}: design tokens from Cloudy Canvas`,
    "import androidx.compose.ui.graphics.Color",
    "import androidx.compose.ui.text.TextStyle",
    "import androidx.compose.ui.text.font.FontWeight",
    "import androidx.compose.ui.unit.dp",
    "import androidx.compose.ui.unit.sp",
    "",
  ];
  for (const axis of tokens.axes) {
    if (!tokens.variables.some((v) => axisOf(tokens, v)?.id === axis.id)) continue;
    const cases = axis.modes.map((m) =>
      safeIdentifier(m.caseName.charAt(0).toUpperCase() + m.caseName.slice(1)),
    );
    out.push(`enum class ${axis.typeName} { ${cases.join(", ")} }`, "");
  }
  out.push("object Tokens {");
  for (const group of ["colors", "numbers", "strings", "flags"] as const) {
    const members = tokens.variables.filter((v) => nativeGroup(v) === group);
    if (members.length === 0) continue;
    out.push(`    object ${GROUPS[group]} {`);
    for (const v of members) out.push(...member(tokens, v));
    out.push("    }");
  }
  if (tokens.textStyles.length > 0) {
    out.push("    object TextStyles {");
    for (const t of tokens.textStyles) {
      out.push(
        `        /** ${t.path}: ${t.family} (set its FontFamily where you load the font). */`,
        `        val ${safeIdentifier(t.kotlinName)} = TextStyle(fontSize = ${formatNumber(t.size)}.sp, fontWeight = FontWeight(${t.weight}), lineHeight = ${formatNumber(t.size * t.lineHeight)}.sp, letterSpacing = ${formatNumber(t.letterSpacing)}.sp)`,
      );
    }
    out.push("    }");
  }
  out.push("}", "");
  return out.join("\n");
}

function member(tokens: CodeTokens, v: CodeVariable): string[] {
  const name = safeIdentifier(v.kotlinName);
  const axis = axisOf(tokens, v);
  const constant = v.type === "string" || v.type === "boolean" ? "const val" : "val";
  if (!axis) return [`        ${constant} ${name} = ${kotlinValue(v, v.base)}`];
  const param = axis.typeName.charAt(0).toLowerCase() + axis.typeName.slice(1);
  return [
    `        fun ${name}(${param}: ${axis.typeName}) = when (${param}) {`,
    ...valuesByMode(axis, v).map(({ mode, value }) => {
      const caseName = safeIdentifier(
        mode.caseName.charAt(0).toUpperCase() + mode.caseName.slice(1),
      );
      return `            ${axis.typeName}.${caseName} -> ${kotlinValue(v, value)}`;
    }),
    "        }",
  ];
}

function kotlinValue(v: CodeVariable, value: CodeValue): string {
  if (v.type === "color" && typeof value === "string") return `Color(${argbHex(value)})`;
  if (typeof value === "number") {
    const n = formatNumber(value);
    if (v.unit === "font-size") return `${n}.sp`;
    if (v.unit === "px") return `${n}.dp`;
    return `${n.includes(".") ? n : `${n}.0`}f`;
  }
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}
