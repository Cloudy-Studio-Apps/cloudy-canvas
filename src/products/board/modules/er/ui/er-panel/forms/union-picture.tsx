import { useErShapes } from "../../model";
import { memberName } from "./shape-label";
import { PictureBox } from "./visual";
import type { UnionFormProps } from "./entity-form.types";

const WIDTH = 316;
const GAP = 8;

/** The union as it's drawn: click an entity to select it. */
export function UnionPicture({ union }: UnionFormProps) {
  const shapes = useErShapes();
  const colorOf = (id: string) => shapes.entities.find((e) => e.id === id)?.color;
  const count = union.superclassIds.length;
  const boxW = Math.min(100, (WIDTH - (count - 1) * GAP) / Math.max(count, 1));
  const left = (WIDTH - count * boxW - (count - 1) * GAP) / 2;
  const mid = WIDTH / 2;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} 142`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="block w-full text-muted-foreground"
    >
      {union.superclassIds.map((id, i) => {
        const x = left + i * (boxW + GAP);
        return (
          <g key={id}>
            <path d={`M${x + boxW / 2} 34L${mid} 62`} />
            <PictureBox
              x={x}
              y={6}
              w={boxW}
              h={28}
              label={memberName(shapes, id)}
              color={colorOf(id)}
              id={id}
            />
          </g>
        );
      })}
      <path d={`M${mid} 96V110`} />
      <circle cx={mid} cy={78} r={17} className="fill-surface-sunken stroke-primary" />
      <path
        d={`M${mid - 6} 71v8a6 6 0 0 0 12 0v-8`}
        strokeWidth={2}
        className="stroke-foreground"
      />
      <PictureBox
        x={mid - 55}
        y={110}
        w={110}
        h={28}
        label={memberName(shapes, union.categoryId)}
        color={colorOf(union.categoryId)}
        id={union.categoryId}
      />
    </svg>
  );
}
