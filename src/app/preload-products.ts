import { agentChannel } from "@platform";
import { useProductsStore } from "@shared/stores/products-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "./app.i18n";

/** Lets the first page paint and settle before anything else loads. */
const START_DELAY_MS = 500;
/** A gap between the heavy imports, so the window can answer in between. */
const GAP_MS = 200;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function load(): Promise<void> {
  await pause(START_DELAY_MS);
  await import("@board/ui");
  await pause(GAP_MS);
  await import("@design/ui");
  await pause(GAP_MS);
  // Without a channel no agent can call, so a phone doesn't pay for the tools.
  if (agentChannel) await import("./mcp/agent-runtime");
  useProductsStore.getState().setReady();
}

/**
 * Loads both products behind the first page, so opening one later is instant and agents and Home's
 * starters find them. A product opened before this gets there loads on its own (`lazy-page.tsx`).
 */
export function preloadProducts(): void {
  load().catch((error: unknown) => notifyError(t("products.loadFailed"), error));
}
