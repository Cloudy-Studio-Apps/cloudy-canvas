import { silhouetteShader, underShader, type EffectRenderer } from "@canvas";

import { premultiplied } from "../effect-color";
import type { DropShadowEffect } from "../effect.types";
import { shadowSvg } from "./shadow-svg";

/**
 * A drop shadow: the content's shape moved, grown by its spread, blurred and colored, laid under
 * the result so far; cut out under the layer unless it shows behind.
 */
export const dropShadowRenderer: EffectRenderer<DropShadowEffect> = {
  type: "drop-shadow",
  stage: "behind",
  outset: (e, outset) => Math.max(outset, Math.hypot(e.x, e.y) + e.blur + Math.max(e.spread, 0)),
  render(pass, e, current) {
    const offset = pass.offset(e.x, e.y);
    silhouetteShader.set({
      uOffset: [offset.x, offset.y],
      uSpread: pass.px(e.spread),
      uInvert: 0,
      uColor: premultiplied(e.color, e.opacity),
    });
    const shadow = pass.blur(pass.run(silhouetteShader, pass.content), pass.px(e.blur));
    underShader.set({ uShowBehind: e.showBehind ? 1 : 0 });
    underShader.bind({ uLayer: shadow, uContent: pass.content });
    return pass.run(underShader, current);
  },
  svg(e, { current, result, prefix, offset }) {
    const shadow = `${prefix}s`;
    const shown = e.showBehind ? shadow : `${prefix}t`;
    const cut = e.showBehind
      ? ""
      : `<feComposite in="${shadow}" in2="SourceAlpha" operator="out" result="${shown}"/>`;
    return (
      shadowSvg(e, "SourceAlpha", offset(e.x, e.y), prefix, shadow) +
      cut +
      `<feMerge result="${result}"><feMergeNode in="${shown}"/>` +
      `<feMergeNode in="${current}"/></feMerge>`
    );
  },
};
