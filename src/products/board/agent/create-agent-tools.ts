import { arrangeTools } from "./arrange-tools";
import type { BoardAgentTool } from "./board-agent.types";
import { boardInfoTools } from "./board-info-tools";
import { boardReadTools } from "./board-read-tools";
import { dbTools } from "./db-tools";
import { erTools } from "./er-tools";
import { exportTools } from "./export-tools";
import { fileTools } from "./file-tools";
import { shapeEditTools } from "./shape-edit-tools";
import { stickerTools } from "./sticker-tools";
import { viewTools } from "./view-tools";

/** Every tool agents can call. New tools: add them to a group file (or a new group) and list it here. */
export function createAgentTools(): BoardAgentTool[] {
  return [
    ...boardReadTools,
    ...boardInfoTools,
    ...shapeEditTools,
    ...arrangeTools,
    ...stickerTools,
    ...dbTools,
    ...erTools,
    ...viewTools,
    ...exportTools,
    ...fileTools,
  ];
}
