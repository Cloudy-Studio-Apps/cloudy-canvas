import type { ReactNode } from "react";
import { Braces, KeyRound, Layers, Link, List, Pencil } from "lucide-react";

import { Button, cn } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import { toDraft } from "./connection-draft";
import type { ConnectionCardProps } from "./connection-card.types";
import type { ConnectionTab } from "./connection-tabs.types";
import { urlParts } from "./url-parts";

/**
 * A link at a glance: GET or POST, the site, the path, and a tag for each thing set (a link
 * setting, the sign-in, the headers, the body); a tag opens the dialog on its tab.
 */
export function ConnectionCard({ values, stored, onOpen }: ConnectionCardProps) {
  const draft = toDraft(values, stored);
  const parts = urlParts(draft.url);
  const chips: { tab: ConnectionTab; icon: ReactNode; label: string; key: string }[] = [];
  draft.params
    .filter((p) => p.name.trim() !== "")
    .forEach((p, i) => {
      const label = `${p.name} = ${p.value}`;
      chips.push({ tab: "params", icon: <Link />, label, key: `param:${i}:${p.name}` });
    });
  if (draft.auth !== "none") {
    chips.push({
      tab: "auth",
      icon: <KeyRound />,
      label: t(`connection.auth.kinds.${draft.auth}.label`),
      key: "auth",
    });
  }
  const headers = draft.headers.filter((h) => h.name.trim() !== "").length;
  if (headers > 0) {
    chips.push({
      tab: "headers",
      icon: <List />,
      label: t("connection.card.headers", { count: headers }),
      key: "headers",
    });
  }
  if (draft.method === "POST" && draft.bodyKind !== "none") {
    chips.push({
      tab: "body",
      icon: <Braces />,
      label: t(`connection.card.body.${draft.bodyKind}`),
      key: "body",
    });
  }
  if (draft.pagination !== "none") {
    chips.push({
      tab: "pages",
      icon: <Layers />,
      label: t(`connection.card.pages.${draft.pagination}`),
      key: "pages",
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen("params")}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            onOpen("params");
          }
        }}
        className="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border bg-surface-sunken p-2.5 text-left outline-none hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
          <span
            className={cn(
              "rounded-sm px-1 py-px font-mono text-[10px] font-bold tracking-wide",
              draft.method === "POST"
                ? "bg-accent-soft text-accent-soft-foreground"
                : "bg-primary-soft text-primary-soft-foreground",
            )}
          >
            {draft.method}
          </span>
          <span className="truncate">
            {parts.ok ? parts.host : draft.url || t("connection.card.noLink")}
          </span>
        </div>
        {parts.ok && parts.path !== "/" && (
          <code className="truncate text-xs text-muted-foreground">{parts.path}</code>
        )}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chips.map((chip) => (
              <Button
                key={chip.key}
                size="xs"
                variant="outline"
                className="h-5 max-w-full px-1.5 text-[11px] font-normal text-muted-foreground [&_svg]:size-3"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(chip.tab);
                }}
              >
                {chip.icon}
                <span className="truncate">{chip.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
      <Button size="sm" variant="outline" className="self-start" onClick={() => onOpen("params")}>
        <Pencil />
        {t("connection.card.edit")}
      </Button>
    </div>
  );
}
