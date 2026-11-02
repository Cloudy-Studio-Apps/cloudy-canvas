/** The tools the phone's bar always shows; every other one is in the sheet. */
export const QUICK_TOOLS: readonly string[] = ["select", "hand"];

export function isQuickTool(tool: string): boolean {
  return QUICK_TOOLS.includes(tool);
}
