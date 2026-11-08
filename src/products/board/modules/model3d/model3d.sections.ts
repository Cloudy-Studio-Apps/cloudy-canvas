import type { CanvasEngine } from "@canvas";
import { importModelFiles, ModelSizeDialog } from "@canvas-ui";
import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { CONVERT_MODEL_COMMAND, EDIT_MODEL_COMMAND, PLACE_MODEL_COMMAND } from "./model3d.commands";
import { createModel } from "./model3d.factory";
import { Model3dConvert, Model3dLive, Model3dPanel, useModelCommands } from "./ui";
import { selectedModel } from "./ui/selected-model";
import { t } from "./model3d.i18n";

const canConvert = (_context: unknown, engine: CanvasEngine) =>
  selectedModel(engine) !== null && !engine.doc.isReadOnly;

/** The panel, the live view, the dialogs, the commands and the context menu items. */
export function registerModel3dSections(host: ModuleHost): void {
  // Dropped model files (with their textures) become models.
  host.contribute(boardCanvas.importFiles, (request) =>
    importModelFiles(request.files, request.view, createModel, request.doc, request.nextIndex),
  );
  // The panel sits in the side dock: it is too tall for the selection's floating bar.
  host.contribute(boardEditor.sidePanels, {
    id: "model3d.panel",
    order: 30,
    component: Model3dPanel,
  });
  host.contribute(boardEditor.overlays, { id: "model3d.live", component: Model3dLive });
  host.contribute(boardEditor.overlays, { id: "model3d.convert", component: Model3dConvert });
  // A model over the size warning asks before it is placed: this dialog answers.
  host.contribute(boardEditor.overlays, { id: "model3d.size", component: ModelSizeDialog });
  host.contribute(boardEditor.sessionHooks, { id: "model3d.commands", use: useModelCommands });
  host.contribute(boardEditor.contextMenu, {
    id: "model3d",
    menu: "selection",
    items: [
      {
        command: EDIT_MODEL_COMMAND,
        label: t("menu.edit"),
        enabled: (_context, engine) => {
          const el = selectedModel(engine);
          return (
            el !== null &&
            !engine.doc.isReadOnly &&
            engine.doc.getAsset(el.modelAssetId) !== undefined
          );
        },
      },
      { command: CONVERT_MODEL_COMMAND, label: t("menu.convert"), enabled: canConvert },
    ],
  });
  host.contribute(boardEditor.contextMenu, {
    id: "model3d.place",
    menu: "canvas",
    items: [{ command: PLACE_MODEL_COMMAND, label: t("menu.place") }],
  });
}
