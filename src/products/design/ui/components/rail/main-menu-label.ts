import { BASE_COMMAND_LABELS } from "@canvas";

import type { MainMenuItem } from "../../modules";

const COMMAND_LABELS: Readonly<Record<string, string | undefined>> = BASE_COMMAND_LABELS;

/** An item's name: its own label, or its command's. */
export function mainMenuLabel(item: MainMenuItem): string {
  return "command" in item
    ? (item.label ?? COMMAND_LABELS[item.command] ?? item.command)
    : item.label;
}
