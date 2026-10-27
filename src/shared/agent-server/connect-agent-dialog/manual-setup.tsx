import { GENERIC_AGENT_CLIENT } from "../agent-clients";
import { CopyRow } from "../copy-row";
import { NO_URL } from "./no-url";
import type { ManualSetupProps } from "./connect-agent-dialog.types";
import { t } from "../agent-server.i18n";

// Markers for the server's name and transport in the translated sentence, which are styled.
const NAME = "\uE000";
const TRANSPORT = "\uE001";

/** The default settings for any agent: the server's URL, transport and a JSON entry. */
export function ManualSetup({ url }: ManualSetupProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {t("connect.manual.body", { name: NAME, transport: TRANSPORT })
          .split(/(\uE000|\uE001)/)
          .map((part, index) =>
            part === NAME ? (
              <span key={index} className="font-mono text-foreground">
                cloudy-canvas
              </span>
            ) : part === TRANSPORT ? (
              <span key={index} className="font-medium text-foreground">
                Streamable HTTP
              </span>
            ) : (
              part
            ),
          )}
      </p>
      <CopyRow label={t("connect.manual.serverUrl")} value={url ?? NO_URL} disabled={!url} />
      <CopyRow
        label={GENERIC_AGENT_CLIENT.snippetLabel}
        value={GENERIC_AGENT_CLIENT.snippet(url ?? NO_URL)}
        hint={GENERIC_AGENT_CLIENT.where}
        disabled={!url}
      />
    </div>
  );
}
