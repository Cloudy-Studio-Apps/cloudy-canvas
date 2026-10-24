import { useState } from "react";

import { http, shareTransport } from "@platform";
import type { RelaySettings } from "@shared/core";
import type { RelayTestState } from "./relay-test.types";

/**
 * Tests a relay: the app coming online through it, and when that fails, whether the server
 * answers at all, to tell a wrong token from a server that can't be reached.
 */
export function useRelayTest() {
  const [state, setState] = useState<RelayTestState>({ status: "idle" });

  const test = async (relay: RelaySettings) => {
    if (!shareTransport) {
      setState({ status: "failed", message: "Live sessions need the desktop app." });
      return;
    }
    setState({ status: "testing" });
    const result = await shareTransport.testRelay(relay).catch((error: unknown) => ({
      ok: false,
      millis: null,
      error: String(error),
    }));
    if (result.ok) {
      setState({ status: "ok", millis: result.millis ?? 0 });
      return;
    }
    const answers = await http.getText(healthUrl(relay.url)).then(
      () => true,
      () => false,
    );
    setState({
      status: "failed",
      message: answers
        ? "The relay answers but didn't let the app in: check the token."
        : `${result.error ?? "It didn't answer."} The server can't be reached: check the address, that it's running and that ports 80, 443 and 7842/udp are open.`,
    });
  };

  return { state, test, reset: () => setState({ status: "idle" }) };
}

/** The relay's health check, next to its URL. */
function healthUrl(url: string): string {
  return `${url.trim().replace(/\/+$/, "")}/healthz`;
}
