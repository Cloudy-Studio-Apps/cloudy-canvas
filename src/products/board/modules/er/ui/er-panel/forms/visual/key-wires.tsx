import { useLayoutEffect, useRef, useState } from "react";

import type { KeyWiresProps } from "./key-wires.types";
import { wirePaths } from "./wire-paths";

/** Lines between the `TableCard` rows of its parent, kept in place as the cards change size. */
export function KeyWires({ wires }: KeyWiresProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState("");
  const key = JSON.stringify(wires);

  useLayoutEffect(() => {
    const box = ref.current?.parentElement;
    if (!box) return;
    const draw = () => setPath(wirePaths(box, wires));
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(box);
    return () => observer.disconnect();
    // `wires` is a new array each render: `key` is what it holds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <svg
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible text-primary"
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.75} />
    </svg>
  );
}
