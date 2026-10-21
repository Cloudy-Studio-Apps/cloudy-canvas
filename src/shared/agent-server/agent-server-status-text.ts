/** One line on whether and where agents can connect. */
export function agentServerStatusText(
  available: boolean,
  enabled: boolean,
  url: string | null,
): string {
  if (!available) return "Agents can connect to the desktop app only.";
  if (!enabled) return "Off. Agents can't reach your boards.";
  if (!url) return "Starting…";
  return `Agents connect at ${url}`;
}
