import { ModelPanel } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import type { ModelNodeElement } from "../model3d.types";
import { useConvertStore } from "./convert-store";

/** For a single selected model: its file, rotation, zoom, textures and actions (the shared panel). */
export function Model3dSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  const ask = useConvertStore((state) => state.ask);
  const [el, ...others] = nodes as readonly ModelNodeElement[];
  if (!el || others.length > 0 || el.type !== "model3d") return null;
  return <ModelPanel engine={engine} id={el.id} data={el} onConvert={() => ask(el.id)} />;
}
