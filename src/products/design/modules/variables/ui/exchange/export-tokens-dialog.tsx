import { FileOutput } from "lucide-react";
import { useMemo, useState } from "react";

import { selectTokens, TokenStore, type TokenRecord } from "@canvas";
import { useDocumentMeta, useEditorModules } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { clipboard, exportFile } from "@platform";
import { tCommon } from "@shared/core";
import { CodeEditor } from "@shared/ui/components/code-editor";
import { notifyError, toast } from "@shared/stores/toast-store";
import { AppDialog, Button, EmptyState, SelectField } from "@shared/ui/kit";

import { designStyleTypes } from "../../../core/ui";
import type { TokenFormat } from "../../exchange";
import type { ExportTokensBodyProps } from "./exchange.types";
import { useExportTokensStore } from "./export-tokens-store";
import { allKeys, pickOf, pickRows } from "./pick-rows";
import { TokenPickTree } from "./token-pick-tree";
import { useTokenFormats } from "./use-token-formats";
import { t } from "../../variables.i18n";

const NO_LANGUAGE: never[] = [];
const ignore = () => {};

/**
 * Exporting the design's variables and styles: pick a format, tick collections, style types or
 * their groups (what they alias comes along so the file resolves), see the file, copy or save it.
 */
export function ExportTokensDialog() {
  const open = useExportTokensStore((state) => state.open);
  const setOpen = useExportTokensStore((state) => state.setOpen);
  const formats = useTokenFormats().filter((format) => format.write);
  const [first] = formats;
  return open && first ? (
    <ExportBody formats={formats} first={first} onClose={() => setOpen(false)} />
  ) : null;
}

function ExportBody({ formats, first, onClose }: ExportTokensBodyProps) {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const { title } = useDocumentMeta(engine.doc);
  const name = title.trim() || "Design tokens";
  const records = useMemo(() => engine.doc.tokenRecords(), [engine]);
  const rows = useMemo(
    () =>
      pickRows(
        records,
        (type) => host.find(designStyleTypes, type)?.heading ?? t("import.styles", { type }),
      ),
    [records, host],
  );
  const [formatId, setFormatId] = useState(first.id);
  const [ticked, setTicked] = useState(() => allKeys(rows));
  const format = formats.find((each) => each.id === formatId) ?? first;
  const selected = useMemo(() => selectTokens(records, pickOf(records, ticked)), [records, ticked]);
  const count = ticked.size === 0 ? 0 : selected.records.length;
  const text = useMemo(
    () => (count === 0 ? null : writeFile(format, selected.records, name)),
    [format, selected, name, count],
  );

  const copy = async () => {
    try {
      await clipboard.writeText(text ?? "");
      toast({ title: t("export.copied") });
    } catch (error) {
      notifyError(t("export.copyError"), error);
    }
  };
  const save = async () => {
    try {
      const saved = await exportFile(
        new Blob([text ?? ""], { type: "text/plain" }),
        fileName(name),
        {
          extension: format.extension,
          label: format.fileLabel,
        },
      );
      if (!saved) return;
      toast({ title: t("exchange.exported", { format: format.label }) });
      onClose();
    } catch (error) {
      notifyError(t("exchange.exportError"), error);
    }
  };

  return (
    <AppDialog
      open
      onOpenChange={(next) => !next && onClose()}
      title={t("export.title")}
      description={t("export.description")}
      size="xl"
      bodyClassName="flex h-[min(560px,70vh)] gap-4"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button variant="outline" disabled={text === null} onClick={() => void copy()}>
            {t("export.copy")}
          </Button>
          <Button disabled={text === null} onClick={() => void save()}>
            {tCommon("save")}
          </Button>
        </>
      }
    >
      <aside className="flex w-60 shrink-0 flex-col gap-3">
        <SelectField
          layout="stacked"
          label={t("export.format")}
          value={format.id}
          options={formats.map((each) => ({ value: each.id, label: each.label }))}
          onChange={setFormatId}
        />
        <TokenPickTree
          rows={rows}
          ticked={ticked}
          onChange={setTicked}
          className="max-h-none min-h-0 flex-1"
        />
        {count > 0 && selected.extra > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("export.extra", { count: selected.extra })}
          </p>
        )}
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        {text === null ? (
          <EmptyState
            icon={<FileOutput />}
            title={count === 0 ? t("export.emptyTitle") : t("exchange.exportError")}
            description={count === 0 ? t("export.emptyDescription") : undefined}
            className="flex-1"
          />
        ) : (
          <CodeEditor
            value={text}
            onChange={ignore}
            language={NO_LANGUAGE}
            label={t("export.preview", { format: format.label })}
            readOnly
            className="min-h-0 flex-1"
          />
        )}
      </section>
    </AppDialog>
  );
}

/** The file for the picked tokens, written from them alone; `null` when the format fails. */
function writeFile(
  format: TokenFormat,
  records: readonly TokenRecord[],
  name: string,
): string | null {
  try {
    return format.write?.(new TokenStore(records), name) ?? null;
  } catch (error) {
    console.warn(`The ${format.id} tokens format failed`, error);
    return null;
  }
}

/** A title fit for a file name. */
function fileName(title: string): string {
  return title.replace(/[\\/:*?"<>|]+/g, "-").trim() || "Design tokens";
}
