import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, Info, RefreshCw } from "lucide-react";

import { CommitInput } from "@canvas-ui";
import { IconButton, cn } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import { FieldKindMenu } from "./field-kind-menu";
import type { FieldLeafRowProps } from "./field-leaf-row.types";
import { fieldTypeLabel } from "./field-type-label";
import { FieldTypeIcon } from "./field-type-icon";

const INDENT = 14;

/**
 * One field: its kind as an icon (a menu to change it or rename the field), its name, a sample
 * and hide. A list of objects opens to show the fields inside each item.
 */
export function FieldLeafRow({
  node,
  depth,
  sample,
  needsUpdate,
  open,
  onToggle,
  onChange,
}: FieldLeafRowProps) {
  const { field, inner } = node;
  const [renaming, setRenaming] = useState(false);
  const kind = fieldTypeLabel(field.type);
  const pad = { paddingLeft: 4 + depth * INDENT };

  return (
    <li className="flex flex-col">
      <div
        className={cn(
          "group flex min-w-0 items-start gap-2 rounded-md py-1.5 pr-1 hover:bg-hover",
          field.hidden && "opacity-55",
        )}
        style={pad}
      >
        <FieldKindMenu field={field} onChange={onChange} onRename={() => setRenaming(true)}>
          <IconButton
            size="md"
            label={t("fields.kindMenu.button", { kind })}
            className="shrink-0 border border-border bg-surface"
          >
            <FieldTypeIcon type={field.type} />
          </IconButton>
        </FieldKindMenu>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {renaming ? (
            <CommitInput
              autoFocus
              aria-label={t("fields.alias")}
              value={field.alias ?? node.name}
              onCommit={(draft) => {
                setRenaming(false);
                const alias = draft.trim();
                const next = { ...field };
                if (alias && alias !== node.name) next.alias = alias;
                else delete next.alias;
                onChange(next);
              }}
              onBlur={() => setRenaming(false)}
              className="h-6 text-xs"
            />
          ) : (
            <div className="flex min-w-0 items-center gap-1">
              {inner && (
                <IconButton
                  size="xs"
                  label={open ? t("fields.collapse") : t("fields.expand")}
                  onClick={onToggle}
                >
                  {open ? <ChevronDown /> : <ChevronRight />}
                </IconButton>
              )}
              <code
                className={cn(
                  "min-w-0 truncate text-xs font-medium text-foreground",
                  field.hidden && "line-through",
                )}
                title={field.path}
              >
                {field.alias ?? node.name}
              </code>
            </div>
          )}
          <p className="truncate text-xs text-muted-foreground" title={sample}>
            {inner
              ? t("fields.listOfItems", { count: inner.length })
              : sample
                ? `${kind} · ${sample}`
                : kind}
          </p>
        </div>
        <IconButton
          size="xs"
          revealOnHover={!field.hidden}
          label={field.hidden ? t("fields.show") : t("fields.hide")}
          onClick={() => onChange({ ...field, hidden: !field.hidden })}
        >
          {field.hidden ? <EyeOff /> : <Eye />}
        </IconButton>
      </div>
      {needsUpdate && (
        <p
          className="flex items-center gap-1 pb-1 text-xs text-warning"
          style={{ paddingLeft: 40 + depth * INDENT }}
        >
          <RefreshCw className="size-3 shrink-0" />
          {t("fields.updateForImages")}
        </p>
      )}
      {inner && open && (
        <div className="flex flex-col gap-0.5 pb-1" style={{ paddingLeft: 40 + depth * INDENT }}>
          <p className="flex gap-1.5 rounded-sm bg-muted px-2 py-1.5 text-xs text-muted-foreground">
            <Info className="mt-px size-3 shrink-0" />
            {t("fields.innerNote", { name: field.alias ?? node.name })}
          </p>
          {inner.map((item) => {
            return (
              <div key={item.path} className="flex min-w-0 items-center gap-1.5 py-0.5 text-xs">
                <FieldTypeIcon
                  type={item.type}
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <code className="truncate">{item.path}</code>
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {fieldTypeLabel(item.type)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}
