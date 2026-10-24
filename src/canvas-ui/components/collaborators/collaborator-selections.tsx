import { useEngine } from "../../engine-context";
import { useViewMapping } from "../../overlay";
import { rectToScreen } from "./to-screen";
import { useCollaboratorsHere } from "./use-collaborators-here";
import { useViewVersion } from "./use-view-version";

/** Outlines, in each collaborator's colour, round what it has selected on this page. */
export function CollaboratorSelections() {
  const engine = useEngine();
  const view = useViewMapping();
  const here = useCollaboratorsHere();
  // Elements move without the camera moving: draw again on every change.
  useViewVersion();

  return here.flatMap((collaborator) =>
    collaborator.state.selection.map((id, i) => {
      const bounds = engine.elementsBounds([id]);
      if (!bounds) return null;
      const box = rectToScreen(view, bounds);
      return (
        <div
          key={`${collaborator.id}:${id}`}
          className="absolute top-0 left-0 border-2"
          style={{
            borderColor: collaborator.color,
            transform: `translate(${box.x - 2}px, ${box.y - 2}px)`,
            width: box.w + 4,
            height: box.h + 4,
          }}
        >
          {i === 0 && (
            <span
              className="absolute -top-5 -left-0.5 rounded-t-sm px-1.5 text-[11px] leading-5 font-medium whitespace-nowrap text-surface"
              style={{ background: collaborator.color }}
            >
              {collaborator.name}
            </span>
          )}
        </div>
      );
    }),
  );
}
