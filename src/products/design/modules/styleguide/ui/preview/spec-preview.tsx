import { useLayoutEffect, useRef, useState } from "react";

import { SpecNode } from "./spec-node";
import type { SpecPreviewProps } from "./spec-preview.types";

/** Room kept round the content, and on the right for the card's selected tick. */
const PAD = 12;
const TICK_ROOM = 28;

/**
 * A small picture of generated content (a template's thumbnail with the file's real tokens):
 * the specs drawn as DOM, scaled down to fit the box it's placed in (its width and `height`),
 * clear of the card's tick. Document colors, not UI tokens.
 */
export function SpecPreview({ specs, height }: SpecPreviewProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useLayoutEffect(() => {
    const box = outer.current;
    const content = inner.current;
    if (!box || !content) return;
    const fit = () => {
      const w = content.scrollWidth;
      const h = content.scrollHeight;
      if (w === 0 || h === 0) return;
      const room = { w: box.clientWidth - PAD - TICK_ROOM, h: height - PAD * 2 };
      setScale(Math.min(1, room.w / w, room.h / h));
    };
    fit();
    // The panel can be resized: fit again when the box changes width.
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [specs, height]);

  return (
    // The sheet's own surface (document content): white in every theme.
    <div
      ref={outer}
      className="relative w-full overflow-hidden"
      style={{ height, background: "#FFFFFF" }}
      aria-hidden
    >
      <div
        ref={inner}
        className="absolute flex w-max flex-col items-start gap-6"
        style={{ left: PAD, top: PAD, transform: `scale(${scale})`, transformOrigin: "0 0" }}
      >
        {specs.map((spec) => (
          <SpecNode key={spec.key} spec={spec} />
        ))}
      </div>
    </div>
  );
}
