import { ModelLiveBody } from "./model-live-body";
import { useModelEditStore } from "./model-edit-store";
import type { ModelLiveViewProps } from "./model-live-view.types";

/**
 * The live 3D view of the model the store has live in `engine`, drawn over its element; nothing
 * when none is. An editor mounts it as an overlay over its canvas (see the README's "Editing").
 */
export function ModelLiveView(props: ModelLiveViewProps) {
  const id = useModelEditStore((state) => (state.engine === props.engine ? state.id : null));
  const draft = useModelEditStore((state) => (state.engine === props.engine ? state.draft : null));
  if (!id || !draft) return null;
  return <ModelLiveBody {...props} key={id} id={id} draft={draft} />;
}
