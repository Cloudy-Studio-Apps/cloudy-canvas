import { useErShapes } from "../../model";
import { memberName } from "./shape-label";
import { PictureBox, PictureDiamond } from "./visual";
import type { ConstraintFormProps } from "./entity-form.types";

const ARROW = "er-constraint-arrow";

/** What a constraint links, with its mark: click a shape to select it. */
export function ConstraintPicture({ constraint }: ConstraintFormProps) {
  const shapes = useErShapes();
  const { rule, min, max } = constraint;
  const from = shapes.relations.find((r) => r.id === constraint.fromId);
  const to = shapes.relations.find((r) => r.id === constraint.toId);
  const withEntity = rule === "exclusive" || rule === "inclusive";
  const defs = (
    <defs>
      <marker id={ARROW} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0 0 7 3.5 0 7Z" fill="currentColor" stroke="none" className="text-primary" />
      </marker>
    </defs>
  );
  const frame = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    className: "block w-full text-muted-foreground",
  };

  if (!withEntity) {
    return (
      <svg viewBox="0 0 316 80" {...frame}>
        {defs}
        <path
          d={rule === "inclusion" ? "M200 40H116" : "M116 40H200"}
          strokeWidth={2.5}
          className="stroke-primary"
          markerEnd={rule === "inclusion" ? `url(#${ARROW})` : undefined}
        />
        <PictureDiamond cx={58} cy={40} w={116} h={52} label={from?.name ?? ""} id={from?.id} />
        <PictureDiamond cx={258} cy={40} w={116} h={52} label={to?.name ?? ""} id={to?.id} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 316 150" {...frame}>
      {defs}
      <path d="M96 75H128M128 75 200 34M128 75 200 116" />
      <PictureBox
        x={8}
        y={59}
        w={90}
        h={32}
        label={memberName(shapes, constraint.entityId)}
        color={shapes.entities.find((e) => e.id === constraint.entityId)?.color}
        id={constraint.entityId || undefined}
      />
      <PictureDiamond cx={250} cy={34} w={116} h={52} label={from?.name ?? ""} id={from?.id} />
      <PictureDiamond cx={250} cy={116} w={116} h={52} label={to?.name ?? ""} id={to?.id} />
      {rule === "exclusive" ? (
        <path d="M158 52Q172 75 158 98" strokeWidth={2.5} className="stroke-primary" />
      ) : (
        <>
          <path
            d="M250 90V60"
            strokeWidth={2.5}
            strokeDasharray="4 3"
            className="stroke-primary"
            markerEnd={`url(#${ARROW})`}
          />
          <text
            x={282}
            y={79}
            textAnchor="middle"
            stroke="none"
            fill="currentColor"
            className="text-[11px] text-primary"
          >
            {`(${min},${max})`}
          </text>
        </>
      )}
    </svg>
  );
}
