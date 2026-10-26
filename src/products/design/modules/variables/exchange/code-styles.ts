import {
  camelPath,
  slugPath,
  splitTokenColor,
  uniqueNames,
  type CodeShadowStyle,
  type CodeStyles,
  type CodeTextStyle,
  type TokenStore,
} from "@canvas";

import { EFFECT_STYLE, readEffectStyle } from "../../core";
import type { DropShadowEffect, InnerShadowEffect } from "../../effects";
import { readTextStyle, TEXT_STYLE } from "../../text";

const TEXT_PARTS = {
  fontFamily: "family",
  fontSize: "size",
  fontWeight: "weight",
  lineHeight: "lineHeight",
  letterSpacing: "letterSpacing",
} as const;

/** The design's text styles and shadow-only effect styles, for the code writers. */
export function designCodeStyles(
  store: TokenStore,
  cssNameOf: (variableId: string) => string | null,
): CodeStyles {
  const texts = store.styles(TEXT_STYLE);
  const names = styleNames(texts.map((s) => s.name));
  const textStyles: CodeTextStyle[] = texts.map((style, i) => {
    const value = readTextStyle(style.value);
    const vars: CodeTextStyle["vars"] = {};
    for (const [path, part] of Object.entries(TEXT_PARTS)) {
      const id = style.bindings?.[path];
      const name = id ? cssNameOf(id) : null;
      if (name) vars[part] = name;
    }
    return {
      path: style.name,
      ...(names[i] as ReturnType<typeof styleNames>[number]),
      family: value.fontFamily ?? "Inter",
      size: value.fontSize ?? 16,
      weight: Number(value.fontWeight ?? 400),
      lineHeight: value.lineHeight ?? 1.2,
      letterSpacing: value.letterSpacing ?? 0,
      vars,
    };
  });

  const shadowStyles = store.styles(EFFECT_STYLE).flatMap((style) => {
    const effects = readEffectStyle(style.value)?.effects ?? [];
    const shadows = effects.filter(
      (e): e is DropShadowEffect | InnerShadowEffect =>
        e.visible && (e.type === "drop-shadow" || e.type === "inner-shadow"),
    );
    return shadows.length > 0 && shadows.length === effects.filter((e) => e.visible).length
      ? [{ style, shadows }]
      : [];
  });
  const shadowNames = styleNames(shadowStyles.map(({ style }) => style.name));
  const shadows: CodeShadowStyle[] = shadowStyles.map(({ style, shadows: layers }, i) => ({
    path: style.name,
    ...(shadowNames[i] as ReturnType<typeof styleNames>[number]),
    layers: layers.map((l) => ({
      x: l.x,
      y: l.y,
      blur: l.blur,
      spread: l.spread,
      color: `${splitTokenColor(l.color).hex}${Math.round(l.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`.toUpperCase(),
      inset: l.type === "inner-shadow",
    })),
  }));
  return { textStyles, shadows };
}

function styleNames(paths: readonly string[]) {
  const slugs = uniqueNames(paths.map((p) => slugPath(p)));
  const camels = uniqueNames(
    paths.map((p) => camelPath(p)),
    "",
  );
  const pascals = uniqueNames(
    paths.map((p) => camelPath(p, true)),
    "",
  );
  return paths.map((_, i) => ({
    slug: slugs[i] as string,
    swiftName: camels[i] as string,
    kotlinName: pascals[i] as string,
  }));
}
