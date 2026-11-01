import { useEngine } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { useErSelection } from "../../model";

/** Selects a shape from the panel, keeping the way back; the view stays where it is. */
export function useErGoTo() {
  const engine = useEngine();
  const { id } = useErSelection();
  const trail = useBoardPanelStore((state) => state.erTrail);
  const setTrail = useBoardPanelStore((state) => state.setErTrail);

  const goTo = (target: string) => {
    if (id && id !== target) setTrail({ from: [...trail.from, id], at: target });
    engine.select([target]);
  };
  const previous = trail.from.at(-1) ?? null;
  const back = () => {
    if (!previous) return;
    setTrail({ from: trail.from.slice(0, -1), at: previous });
    engine.select([previous]);
  };
  return { goTo, back, previous };
}
