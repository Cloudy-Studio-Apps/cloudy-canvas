import { useErShapes } from "../../model";
import { memberName } from "./shape-label";
import { PictureBox, PictureDiamond } from "./visual";
import type { AggregateFormProps } from "./entity-form.types";

/** The box round the relation, as it's drawn: click what's inside to select it. */
export function AggregatePicture({ aggregate }: AggregateFormProps) {
  const shapes = useErShapes();
  const relation = shapes.relations.find((r) => r.id === aggregate.relationId);
  const [first, second] = relation?.participants ?? [];
  const box = (side: typeof first, x: number) =>
    side && (
      <PictureBox
        x={x}
        y={52}
        w={72}
        h={32}
        label={memberName(shapes, side.entityId)}
        color={shapes.entities.find((e) => e.id === side.entityId)?.color}
        id={side.entityId}
      />
    );

  return (
    <svg
      viewBox="0 0 316 110"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="block w-full text-muted-foreground"
    >
      <rect x="3" y="3" width="310" height="104" className="stroke-primary" />
      <path d="M3 25H313" className="stroke-primary" />
      <text
        x="158"
        y="19"
        textAnchor="middle"
        stroke="none"
        fill="currentColor"
        className="text-[12px] font-semibold text-foreground"
      >
        {aggregate.name}
      </text>
      <path d="M84 68H232" />
      {box(first, 12)}
      {box(second, 232)}
      {relation && (
        <PictureDiamond cx={158} cy={68} w={92} h={48} label={relation.name} id={relation.id} />
      )}
    </svg>
  );
}
