import { clipboard, openExternal } from "@platform";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { AgentClient } from "./agent-clients.types";

/** Copies `text` and confirms it with a toast. */
export function copyText(text: string, title: string, description?: string): void {
  void clipboard.writeText(text).then(
    () => toast({ title, description }),
    (error: unknown) => notifyError("Couldn't copy to the clipboard", error),
  );
}

/** Copies an agent app's setup, saying where it goes. */
export function copyAgentSetup(client: AgentClient, url: string): void {
  copyText(client.snippet(url), `${client.label} setup copied`, client.where);
}

/** Opens the agent app's one-click install link. */
export function installInAgent(client: AgentClient, url: string): void {
  if (!client.installLink) return;
  openExternal(client.installLink(url)).catch((error: unknown) =>
    notifyError(`Couldn't open ${client.label}`, error),
  );
}
