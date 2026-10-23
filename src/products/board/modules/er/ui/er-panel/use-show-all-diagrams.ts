import { useEngine } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";

/** Goes back to the list of the board's diagrams: no diagram shown, nothing selected. */
export function useShowAllDiagrams(): () => void {
  const engine = useEngine();
  const setDiagram = useBoardPanelStore((state) => state.setErDiagram);
  return () => {
    engine.select([]);
    setDiagram(null);
  };
}
