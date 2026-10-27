import { createId } from "@shared/core";

import type { BoardStarter } from "../../../core/ui";
import { ER_MODE_ID } from "../../mode";
import { ER_MODEL } from "../../model";
import { t } from "../../er.i18n";
import preview from "./er-diagram.svg";

/** Home's "ER diagram": a small library model, opened in the ER mode. */
export const erDiagramStarter: BoardStarter = {
  id: "er-diagram",
  label: t("starters.erDiagram.label"),
  description: t("starters.erDiagram.description"),
  preview,
  order: 10,
  start: (engine) => {
    engine.service(ER_MODEL).diagram(createId()).applyText(t("starters.erDiagram.text"), {
      createMissing: true,
    });
    engine.setMode(ER_MODE_ID);
    engine.zoomToFit();
  },
};
