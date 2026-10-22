// The board's tools for agents (MCP): read, edit, view and file tools on the open board, built
// from the canvas agent helpers. The app serves them (see `app/mcp`).
export type * from "./board-agent.types";
export { AGENT_INSTRUCTIONS } from "./agent-instructions";
export { createAgentTools } from "./create-agent-tools";
export { requireBoard, requireShapes } from "./board-access";
export { reportApplied } from "./apply-result";
export { arrangeTools } from "./arrange-tools";
export { boardInfoTools } from "./board-info-tools";
export { boardReadTools } from "./board-read-tools";
export { createShapesTool } from "./create-shapes-tool";
export { dbTools } from "../modules/db/db.agent-tools";
export { erTools } from "./er-tools";
export { exportTools } from "./export-tools";
export { fileTools } from "./file-tools";
export { shapeEditTools } from "./shape-edit-tools";
export { stickerTools } from "./sticker-tools";
export { viewTools } from "./view-tools";
