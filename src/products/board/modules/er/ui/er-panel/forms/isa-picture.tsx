import { useErShapes } from "../../model";
import { memberName } from "./shape-label";
import { PictureBox } from "./visual";
import type { IsaFormProps } from "./entity-form.types";

const WIDTH = 316;
const GAP = 8;

/** The hierarchy as it's drawn: click the parent or a child to select it. */
export function IsaPicture({ isa }: IsaFormProps) {
  const shapes = useErShapes();
  const colorOf = (id: string) => shapes.entities.find((e) => e.id === id)?.color;
  const count = isa.children.length;
  const boxW = Math.min(100, (WIDTH - (count - 1) * GAP) / Math.max(count, 1));
  const left = (WIDTH - count * boxW - (count - 1) * GAP) / 2;
  const mid = WIDTH / 2;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} 170`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="block w-full text-muted-foreground"
    >
      <path d={`M${mid} 36V68`} />
      <path d={`M${mid - 30} 68H${mid + 30}L${mid} 100Z`} className="fill-surface-sunken" />
      {isa.total && (
        <circle cx={mid} cy={52} r={6} className="fill-surface-sunken stroke-primary" />
      )}
      {isa.exclusive && (
        <path d={`M${mid - 30} 112Q${mid} 130 ${mid + 30} 112`} className="stroke-primary" />
      )}
      <PictureBox
        x={mid - 55}
        y={6}
        w={110}
        h={30}
        label={memberName(shapes, isa.parentId)}
        color={colorOf(isa.parentId)}
        id={isa.parentId}
      />
      {isa.children.map((child, i) => {
        const x = left + i * (boxW + GAP);
        return (
          <g key={child.id}>
            <path d={`M${mid} 100L${x + boxW / 2} 138`} />
            <PictureBox
              x={x}
              y={138}
              w={boxW}
              h={28}
              label={memberName(shapes, child.entityId)}
              color={colorOf(child.entityId)}
              id={child.entityId}
            />
          </g>
        );
      })}
    </svg>
  );
}
