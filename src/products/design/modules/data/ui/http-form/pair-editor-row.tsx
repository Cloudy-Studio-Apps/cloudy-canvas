import { useState } from "react";
import { Lock, LockOpen, Trash2 } from "lucide-react";

import { IconButton, Input, cn } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import type { PairEditorRowProps } from "./pair-editor-row.types";
import { SuggestList } from "./suggest-list";
import { useSuggest } from "./use-suggest";

/** One name and value; a private one's value is hidden, and one this device keeps says so. */
export function PairEditorRow({
  row,
  ghost,
  onChange,
  onRemove,
  secrets,
  hintFor,
  nameSuggestions,
  valueSuggestions,
  addPlaceholder,
}: PairEditorRowProps) {
  const [focus, setFocus] = useState<"name" | "value" | null>(null);
  const names = useSuggest(focus === "name", nameSuggestions?.(row.name) ?? [], (name) =>
    onChange({ ...row, name }),
  );
  const values = useSuggest(
    focus === "value",
    valueSuggestions?.(row.name, row.value) ?? [],
    (value) => onChange({ ...row, value }),
  );
  const hint = ghost ? undefined : hintFor?.(row.name);
  const blur = () => setFocus(null);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "grid items-center gap-1.5",
          secrets
            ? "grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_28px_28px]"
            : "grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_28px]",
        )}
      >
        <Input
          aria-label={t("source.pairName")}
          value={row.name}
          placeholder={ghost ? addPlaceholder : undefined}
          spellCheck={false}
          autoComplete="off"
          onFocus={() => setFocus("name")}
          onBlur={blur}
          onKeyDown={names.onKeyDown}
          onChange={(event) => onChange({ ...row, name: event.target.value })}
          className="h-7 font-mono text-xs"
        />
        <Input
          aria-label={t("source.pairValue")}
          type={row.secret ? "password" : "text"}
          value={row.value}
          placeholder={row.secret && row.stored ? t("source.secretStored") : undefined}
          spellCheck={false}
          autoComplete="off"
          onFocus={() => setFocus("value")}
          onBlur={blur}
          onKeyDown={values.onKeyDown}
          onChange={(event) => onChange({ ...row, value: event.target.value })}
          className="h-7 text-xs"
        />
        {secrets && (
          <IconButton
            size="sm"
            active={row.secret === true}
            disabled={ghost}
            label={row.secret ? t("connection.private") : t("connection.makePrivate")}
            // Turning it plain can't show a value this device keeps: it's typed again.
            onClick={() => onChange({ ...row, secret: !row.secret, stored: false })}
          >
            {row.secret ? <Lock /> : <LockOpen />}
          </IconButton>
        )}
        <IconButton size="sm" disabled={ghost} label={t("source.pairRemove")} onClick={onRemove}>
          <Trash2 />
        </IconButton>
      </div>
      <SuggestList
        items={names.items}
        active={names.active}
        onPick={(name) => onChange({ ...row, name })}
      />
      <SuggestList
        items={values.items}
        active={values.active}
        onPick={(value) => onChange({ ...row, value })}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
