import { specStyle } from "./spec-style";
import type { SpecNodeProps } from "./spec-preview.types";

/** One generated layer drawn as DOM, with its children. */
export function SpecNode({ spec }: SpecNodeProps) {
  const style = specStyle(spec.args);
  if (spec.args.type === "text") return <span style={style}>{String(spec.args.text ?? "")}</span>;
  return (
    <div style={style}>
      {spec.children?.map((child) => (
        <SpecNode key={child.key} spec={child} />
      ))}
    </div>
  );
}
