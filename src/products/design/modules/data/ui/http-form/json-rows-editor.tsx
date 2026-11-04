import { Plus, Trash2 } from "lucide-react";

import { createId } from "@shared/core";
import { Button, IconButton, Input, SelectField } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import type { JsonValueKind } from "./json-body.types";
import type { JsonRowsEditorProps } from "./json-rows-editor.types";

const KINDS: readonly JsonValueKind[] = ["text", "number", "boolean", "null"];

/** A JSON body built from rows: a name, what kind of value, the value. */
export function JsonRowsEditor({ rows, onChange }: JsonRowsEditorProps) {
  const set = (index: number, patch: Partial<(typeof rows)[number]>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1.3fr)_28px] items-center gap-1.5"
        >
          <Input
            aria-label={t("source.pairName")}
            value={row.name}
            spellCheck={false}
            onChange={(event) => set(index, { name: event.target.value })}
            className="h-7 font-mono text-xs"
          />
          <SelectField<JsonValueKind>
            label={t("connection.body.kind")}
            value={row.kind}
            options={KINDS.map((value) => ({ value, label: t(`connection.body.kinds.${value}`) }))}
            onChange={(kind) =>
              set(index, {
                kind,
                value: kind === "boolean" ? "true" : kind === "null" ? "" : row.value,
              })
            }
          />
          {row.kind === "boolean" ? (
            <SelectField<"true" | "false">
              label={t("source.pairValue")}
              value={row.value === "false" ? "false" : "true"}
              options={[
                { value: "true", label: t("connection.body.yes") },
                { value: "false", label: t("connection.body.no") },
              ]}
              onChange={(value) => set(index, { value })}
            />
          ) : (
            <Input
              aria-label={t("source.pairValue")}
              value={row.value}
              disabled={row.kind === "null"}
              placeholder={row.kind === "null" ? "null" : undefined}
              inputMode={row.kind === "number" ? "decimal" : undefined}
              onChange={(event) => set(index, { value: event.target.value })}
              className="h-7 text-xs"
            />
          )}
          <IconButton
            size="sm"
            label={t("source.pairRemove")}
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            <Trash2 />
          </IconButton>
        </div>
      ))}
      <Button
        size="xs"
        variant="ghost"
        className="self-start"
        onClick={() => onChange([...rows, { id: createId(), name: "", kind: "text", value: "" }])}
      >
        <Plus />
        {t("connection.body.addValue")}
      </Button>
    </div>
  );
}
