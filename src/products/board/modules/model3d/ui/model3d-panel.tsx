import { FloatingPanel, ModelPanel, useEngineElement, useEngineState } from "@canvas-ui";
import { useBoardEngine } from "@board/ui/board-engine-context";
import type { ModelElement } from "../model3d.types";
import { t } from "../model3d.i18n";
import { useConvertStore } from "./convert-store";

/** The side panel of the selected model: its file, rotation, zoom, textures and actions. */
export function Model3dPanel() {
  const engine = useBoardEngine();
  const selectedId = useEngineState((state) => state.selectedId);
  const single = useEngineState((state) => state.selectionTypes === "model3d");
  const el = useEngineElement(single ? selectedId : null) as ModelElement | undefined;
  const ask = useConvertStore((state) => state.ask);
  if (!single || !el || el.type !== "model3d") return null;
  return (
    <FloatingPanel
      role="complementary"
      aria-label={t("panel.label")}
      className="max-h-full w-[280px] flex-col items-stretch overflow-y-auto p-0"
    >
      <ModelPanel engine={engine} id={el.id} data={el} onConvert={() => ask(el.id)} />
    </FloatingPanel>
  );
}
