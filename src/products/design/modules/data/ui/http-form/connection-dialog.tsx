import { useState } from "react";
import { Sparkles } from "lucide-react";

import { tCommon } from "@shared/core";
import { AppDialog, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/kit";
import { t } from "../../data.i18n";
import { AuthTab } from "./auth-tab";
import { BodyTab } from "./body-tab";
import { fromDraft, toDraft } from "./connection-draft";
import type { ConnectionDraft } from "./connection-draft.types";
import type { ConnectionDialogProps } from "./connection-dialog.types";
import { connectionSummary } from "./connection-summary";
import type { ConnectionTab } from "./connection-tabs.types";
import { HeadersTab } from "./headers-tab";
import { jsonProblem } from "./json-body";
import { PagesTab } from "./pages-tab";
import { ParamsTab } from "./params-tab";
import { TryPanel } from "./try-panel";
import { UrlBar } from "./url-bar";
import { urlParts } from "./url-parts";

const named = (rows: readonly { name: string }[]) =>
  rows.filter((r) => r.name.trim() !== "").length;

/** How many things a tab holds, for its badge ("" when none). */
function counts(draft: ConnectionDraft): Record<ConnectionTab, number> {
  return {
    params: named(draft.params),
    auth: draft.auth === "none" ? 0 : 1,
    headers: named(draft.headers),
    body: draft.method === "POST" && draft.bodyKind !== "none" ? 1 : 0,
    pages: draft.pagination === "none" ? 0 : 1,
  };
}

/**
 * The Connection dialog: the request in plain words, the link, five tabs (link settings, sign
 * in, headers, body, pages) and Try it beside them. Nothing is saved until "Save and update". It
 * starts from the saved settings when it mounts: the form mounts a fresh one for each opening.
 */
export function ConnectionDialog({
  open,
  onOpenChange,
  tab: openTab,
  values,
  stored,
  onSave,
  onPreview,
  rowsPath,
  onRowsPathChange,
}: ConnectionDialogProps) {
  const [draft, setDraft] = useState(() => toDraft(values, stored));
  const [tab, setTab] = useState<ConnectionTab>(openTab);
  const [path, setPath] = useState(rowsPath);
  const summary = connectionSummary(draft);
  const at = summary.text.indexOf(summary.site);
  const badges = counts(draft);
  const badJson =
    draft.method === "POST" &&
    draft.bodyKind === "json" &&
    draft.jsonMode === "code" &&
    jsonProblem(draft.body) !== null;
  const canSave = urlParts(draft.url).ok && !badJson;
  const dirty =
    JSON.stringify(fromDraft(draft)) !== JSON.stringify(fromDraft(toDraft(values, stored))) ||
    path !== rowsPath;

  const save = () => {
    if (path !== rowsPath) onRowsPathChange?.(path);
    onSave(fromDraft(draft));
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      className="sm:max-w-5xl"
      title={t("connection.title")}
      description={t("connection.description")}
      bodyClassName="p-0 max-h-[75vh]"
      footer={
        <>
          {dirty && (
            <span className="mr-auto self-center text-xs text-muted-foreground">
              {t("connection.unsaved")}
            </span>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button disabled={!canSave} onClick={save}>
            {t("connection.save")}
          </Button>
        </>
      }
    >
      <div className="grid min-h-[480px] grid-cols-[minmax(0,1fr)_300px] border-t border-border">
        <div className="flex min-w-0 flex-col gap-3.5 p-4">
          <p className="flex gap-2 rounded-lg bg-primary-soft px-3 py-2.5 text-sm text-primary-soft-foreground">
            <Sparkles className="mt-0.5 size-4 shrink-0" />
            {at < 0 ? (
              <span>{summary.text}</span>
            ) : (
              <span>
                {summary.text.slice(0, at)}
                <strong className="font-semibold">{summary.site}</strong>
                {summary.text.slice(at + summary.site.length)}
              </span>
            )}
          </p>
          <UrlBar draft={draft} onChange={setDraft} />
          <Tabs value={tab} onValueChange={(value) => setTab(value as ConnectionTab)}>
            <TabsList>
              {(["params", "auth", "headers", "body", "pages"] as const).map((id) => (
                <TabsTrigger key={id} value={id}>
                  {t(`connection.tabs.${id}`)}
                  {badges[id] > 0 && (
                    <span className="ml-1 rounded-sm bg-surface px-1 text-[10px] font-semibold text-muted-foreground">
                      {badges[id]}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="params" className="pt-3">
              <ParamsTab draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="auth" className="pt-3">
              <AuthTab draft={draft} onChange={setDraft} stored={stored} />
            </TabsContent>
            <TabsContent value="headers" className="pt-3">
              <HeadersTab draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="body" className="pt-3">
              <BodyTab draft={draft} onChange={setDraft} />
            </TabsContent>
            <TabsContent value="pages" className="pt-3">
              <PagesTab draft={draft} onChange={setDraft} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex min-w-0 flex-col border-l border-border bg-surface-sunken p-4">
          {onPreview ? (
            <TryPanel draft={draft} onPreview={onPreview} rowsPath={path} onRowsPath={setPath} />
          ) : (
            <p className="text-xs text-muted-foreground">{t("connection.try.unavailable")}</p>
          )}
        </div>
      </div>
    </AppDialog>
  );
}
