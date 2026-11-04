import { useState } from "react";
import { Plus, X } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { Button, Field, IconButton } from "@shared/ui/kit";
import type { PairsFieldProps } from "./pairs-field.types";
import { t } from "../../data.i18n";

/**
 * Names and values (headers). With `secretValues` the values stay on this device: shown empty,
 * a saved one says so, and `""` keeps it. A renamed pair is a new one, so its value is asked again.
 */
export function PairsField({ spec, value, stored, onChange }: PairsFieldProps) {
  const pairs: Record<string, string> =
    value && typeof value === "object" ? (value as Record<string, string>) : {};
  const [adding, setAdding] = useState(false);
  const secret = spec.secretValues === true;

  const rename = (from: string, to: string) => {
    const name = to.trim();
    if (!name || name === from || name in pairs) return;
    const next: Record<string, string> = {};
    for (const [key, v] of Object.entries(pairs)) next[key === from ? name : key] = secret ? "" : v;
    onChange(next);
  };

  return (
    <Field label={spec.label}>
      <div className="flex flex-col gap-1">
        {Object.entries(pairs).map(([name, v]) => (
          <div key={name} className="flex items-center gap-1">
            <CommitInput
              aria-label={t("source.pairName")}
              value={name}
              onCommit={(next) => rename(name, next)}
              className="h-7 w-24 shrink-0 text-xs"
            />
            <CommitInput
              aria-label={t("source.pairValue")}
              type={secret ? "password" : "text"}
              autoComplete="off"
              value={secret ? "" : v}
              placeholder={
                secret && stored.has(`${spec.key}.${name}`) ? t("source.secretStored") : undefined
              }
              onCommit={(next) => {
                if (secret && next === "") return;
                onChange({ ...pairs, [name]: next });
              }}
              className="h-7 min-w-0 flex-1 text-xs"
            />
            <IconButton
              size="xs"
              label={t("source.pairRemove")}
              onClick={() => {
                const rest = { ...pairs };
                delete rest[name];
                onChange(rest);
              }}
            >
              <X />
            </IconButton>
          </div>
        ))}
        {adding && (
          <CommitInput
            autoFocus
            aria-label={t("source.pairName")}
            value=""
            placeholder={t("source.pairName")}
            onCommit={(next) => {
              const name = next.trim();
              if (name && !(name in pairs)) onChange({ ...pairs, [name]: "" });
            }}
            onBlur={() => setAdding(false)}
            className="h-7 text-xs"
          />
        )}
        <Button size="xs" variant="ghost" className="self-start" onClick={() => setAdding(true)}>
          <Plus />
          {t("source.pairAdd")}
        </Button>
      </div>
    </Field>
  );
}
