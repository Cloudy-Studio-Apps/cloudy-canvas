import type { AgentTool } from "./agent-tool.types";
import { boardReadTools } from "./board-read-tools";
import { dbTools } from "./db-tools";
import { erTools } from "./er-tools";
import { fileTools } from "./file-tools";
import { shapeEditTools } from "./shape-edit-tools";
import { viewTools } from "./view-tools";

/** Every tool agents can call. New tools: add them to a group file (or a new group) and list it here. */
export function createAgentTools(): AgentTool[] {
  return [...boardReadTools, ...shapeEditTools, ...dbTools, ...erTools, ...viewTools, ...fileTools];
}
