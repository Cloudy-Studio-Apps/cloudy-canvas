import { Plus } from "lucide-react";

import { createId } from "@shared/core";
import { Button } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import type { ConnectionTabProps } from "./connection-tab.types";
import {
  headerHintText,
  headerNameSuggestions,
  headerValueSuggestions,
  looksSecret,
} from "./header-hints";
import { PairEditor } from "./pair-editor";

const QUICK = [
  { id: "json", name: "Accept", value: "application/json" },
  { id: "fresh", name: "Cache-Control", value: "no-cache" },
  { id: "language", name: "Accept-Language", value: "es" },
] as const;

/**
 * Headers: the common names offered with what they're for and their usual values; a lock keeps a
 * value on this device (keys and tokens start locked).
 */
export function HeadersTab({ draft, onChange }: ConnectionTabProps) {
  const add = (name: string, value: string) => {
    const lower = name.toLowerCase();
    const found = draft.headers.some((h) => h.name.toLowerCase() === lower);
    const headers = found
      ? draft.headers.map((h) => (h.name.toLowerCase() === lower ? { ...h, value } : h))
      : [...draft.headers, { id: createId(), name, value }];
    onChange({ ...draft, headers });
  };
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs text-muted-foreground">{t("connection.headers.intro")}</p>
      <PairEditor
        rows={draft.headers}
        secrets
        nameLabel={t("connection.headers.name")}
        addPlaceholder={t("connection.headers.add")}
        hintFor={headerHintText}
        nameSuggestions={headerNameSuggestions}
        valueSuggestions={headerValueSuggestions}
        autoSecret={looksSecret}
        onChange={(headers) => onChange({ ...draft, headers })}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{t("connection.headers.common")}</span>
        {QUICK.map((q) => (
          <Button key={q.id} size="xs" variant="outline" onClick={() => add(q.name, q.value)}>
            <Plus />
            {t(`connection.headers.quick.${q.id}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
