import type { CanvasStarter } from "@canvas-ui";
import type { BoardEngine } from "../../../board-engine.types";

/** A ready-made start for a new board (Home's "Start from"); see `CanvasStarter`. */
export type BoardStarter = CanvasStarter<BoardEngine>;
