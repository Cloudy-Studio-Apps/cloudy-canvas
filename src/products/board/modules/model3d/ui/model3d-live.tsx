import { ModelLiveView, useModelEditSession } from "@canvas-ui";
import { useBoardEngine } from "@board/ui/board-engine-context";

/** The live 3D view over the model being edited, if any (see `useModelEditSession`). */
export function Model3dLive() {
  const engine = useBoardEngine();
  const session = useModelEditSession(engine);
  if (!session) return null;
  return <ModelLiveView engine={engine} frame={session.frame} data={session.data} />;
}
