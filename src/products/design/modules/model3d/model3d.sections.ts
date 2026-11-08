import { Box } from "lucide-react";

import type { CanvasEngine } from "@canvas";
import { importModelFiles, ModelSizeDialog } from "@canvas-ui";
import type { ModuleHost } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import type { PropertySelection } from "@design/ui/modules";
import { designCanvas } from "../../design-points";
import { CONVERT_MODEL_COMMAND, EDIT_MODEL_COMMAND } from "./model3d.commands";
import { createModelNode } from "./model3d.factory";
import { Model3dConvert, Model3dLive, Model3dSection, useModelCommands } from "./ui";
import { placeModelFile } from "./ui/place-model-file";
import { selectedModel } from "./ui/selected-model";
import { t } from "./model3d.i18n";

const canConvert = (_context: unknown, engine: CanvasEngine<object>) =>
  selectedModel(engine) !== null && !engine.doc.isReadOnly;

/** The panel shows for exactly one selected model. */
const oneModel = ({ nodes }: PropertySelection) =>
  nodes.length === 1 && nodes[0]?.type === "model3d";

/** Dropping model files, the panel, the live view, the dialogs, the menus and the layer icon. */
export function registerModel3dSections(host: ModuleHost): void {
  // Dropped model files (with their textures) become models.
  host.contribute(designCanvas.importFiles, (request) =>
    importModelFiles(request.files, request.view, createModelNode, request.doc, request.nextIndex),
  );
  host.contribute(designEditor.propertySections, {
    id: "model3d",
    order: 15,
    when: oneModel,
    component: Model3dSection,
  });
  host.contribute(designEditor.layerIcons, { type: "model3d", icon: Box });
  host.contribute(designEditor.overlays, { id: "model3d.live", component: Model3dLive });
  host.contribute(designEditor.overlays, { id: "model3d.convert", component: Model3dConvert });
  // A model over the size warning asks before it is placed: this dialog answers.
  host.contribute(designEditor.overlays, { id: "model3d.size", component: ModelSizeDialog });
  host.contribute(designEditor.sessionHooks, { id: "model3d.commands", use: useModelCommands });
  host.contribute(designEditor.mainMenu, {
    id: "model3d",
    order: 25,
    items: [
      { label: t("menu.place"), icon: Box, run: ({ engine }) => void placeModelFile(engine) },
    ],
  });
  host.contribute(designEditor.contextMenu, {
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
}
