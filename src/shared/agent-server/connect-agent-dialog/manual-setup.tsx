import { GENERIC_AGENT_CLIENT } from "../agent-clients";
import { CopyRow } from "../copy-row";
import { NO_URL } from "./no-url";
import type { ManualSetupProps } from "./connect-agent-dialog.types";

/** The default settings for any agent: the server's URL, transport and a JSON entry. */
export function ManualSetup({ url }: ManualSetupProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Any agent that speaks MCP can connect. Add a server named{" "}
        <span className="font-mono text-foreground">cloudy-canvas</span> with the{" "}
        <span className="font-medium text-foreground">Streamable HTTP</span> transport, no
        authentication, at this URL. It only accepts connections from this computer.
      </p>
      <CopyRow label="Server URL" value={url ?? NO_URL} disabled={!url} />
      <CopyRow
        label={GENERIC_AGENT_CLIENT.snippetLabel}
        value={GENERIC_AGENT_CLIENT.snippet(url ?? NO_URL)}
        hint={GENERIC_AGENT_CLIENT.where}
        disabled={!url}
      />
    </div>
  );
}
