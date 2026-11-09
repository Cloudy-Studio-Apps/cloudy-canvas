import type { CanvasEngine } from "@canvas";
import type { MainMenuItem } from "./main-menu.types";

/** Picks an item: runs its engine command, or its action. */
export function runMainMenuItem(
  item: MainMenuItem,
  engine: CanvasEngine,
  navigate: (to: string) => void,
): void {
  if ("command" in item) engine.commands[item.command]?.();
  else item.run({ engine, navigate });
}
