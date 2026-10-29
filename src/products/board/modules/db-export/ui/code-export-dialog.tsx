import { useState } from "react";
import { Database } from "lucide-react";

import { tCommon } from "@shared/core";
import { useEngine } from "@canvas-ui";
import { AppDialog, Button, EmptyState, SegmentedControl } from "@shared/ui/kit";
import { isDbTable } from "../../db";
import { codeTargets, type CodeOptionValue, type CodeTargetDefinition } from "../targets";
import { useCodeExportStore } from "./code-export-store";
import type { CodeExportBodyProps, CodeExportScope } from "./code-export-dialog.types";
import { CodeFileList } from "./code-file-list";
import { CodePreview } from "./code-preview";
import { CodeWarnings } from "./code-warnings";
import { OverwriteDialog } from "./overwrite-dialog";
import { TargetFields } from "./target-fields";
import { useCodeOutput } from "./use-code-output";
import { useSaveCode } from "./use-save-code";
import { t } from "../db-export.i18n";

/**
 * Export code: the schema (or the tables it opened with) as a framework's files. Picks the target,
 * its version and options, previews every file and copies or saves them.
 */
export function CodeExportDialog() {
  const ids = useCodeExportStore((state) => state.ids);
  const close = useCodeExportStore((state) => state.close);
  const targets = codeTargets.list();
  if (ids === null || targets.length === 0) return null;
  return <DialogBody key={ids.join(",")} ids={ids} targets={targets} onDone={close} />;
}

function DialogBody({ ids, targets, onDone }: CodeExportBodyProps) {
  const engine = useEngine();
  const last = useCodeExportStore((state) => state.last);
  const remember = useCodeExportStore((state) => state.remember);
  const [now] = useState(() => new Date());

  const [targetId, setTargetId] = useState(last?.target ?? targets[0]?.id ?? "");
  const target =
    targets.find((each) => each.id === targetId) ?? (targets[0] as CodeTargetDefinition);
  const [profile, setProfile] = useState(last?.profile ?? target.profiles[0]?.id ?? "");
  const [options, setOptions] = useState<Record<string, CodeOptionValue>>({ ...last?.options });

  const tableIds = ids.filter((id) => isDbTable(engine.getElement(id)));
  const oneTable = ids.length === 1 && tableIds.length === 1 ? tableIds[0] : undefined;
  const [scope, setScope] = useState<CodeExportScope>(oneTable ? "table" : "schema");
  const single = scope === "table" && oneTable !== undefined;

  const profileId = target.profiles.some((p) => p.id === profile)
    ? profile
    : (target.profiles[0]?.id ?? "");
  const { output, empty } = useCodeOutput({
    target,
    profile: profileId,
    options,
    ids: single ? [] : ids,
    table: single ? (oneTable ?? null) : null,
    now,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const file = output.files.find((each) => each.path === selected) ?? output.files[0];
  const { copy, save, overwrite, answer } = useSaveCode(`${target.id}-schema`);

  const pickTarget = (id: string) => {
    setTargetId(id);
    setProfile(targets.find((each) => each.id === id)?.profiles[0]?.id ?? "");
    setOptions({});
    setSelected(null);
  };
  const saveAll = async () => {
    remember({ target: target.id, profile: profileId, options });
    if (await save(output.files)) onDone();
  };

  return (
    <>
      <AppDialog
        open
        onOpenChange={(open) => !open && onDone()}
        title={t("dialog.title")}
        description={t("dialog.description")}
        size="xl"
        bodyClassName="flex h-[min(560px,70vh)] gap-4"
        footer={
          <>
            <Button variant="outline" onClick={onDone}>
              {tCommon("cancel")}
            </Button>
            <Button variant="outline" disabled={!file} onClick={() => file && void copy(file)}>
              {t("dialog.copy")}
            </Button>
            <Button disabled={output.files.length === 0} onClick={() => void saveAll()}>
              {output.files.length > 1
                ? t("dialog.saveAll", { count: output.files.length })
                : tCommon("save")}
            </Button>
          </>
        }
      >
        <aside className="flex w-52 shrink-0 flex-col gap-3 overflow-y-auto">
          {oneTable && (
            <SegmentedControl<CodeExportScope>
              label={t("dialog.scope")}
              value={scope}
              fullWidth
              size="sm"
              options={[
                { value: "table", label: t("dialog.thisTable") },
                { value: "schema", label: t("dialog.wholeSchema") },
              ]}
              onChange={(value) => {
                setScope(value);
                setSelected(null);
              }}
            />
          )}
          <TargetFields
            targets={targets}
            target={target}
            profile={profileId}
            options={options}
            onTarget={pickTarget}
            onProfile={setProfile}
            onOption={(id, value) => setOptions((current) => ({ ...current, [id]: value }))}
          />
          <div className="-mx-1 min-h-0 flex-1 overflow-y-auto border-t border-border pt-2">
            <CodeFileList
              files={output.files}
              selected={file?.path ?? null}
              onSelect={setSelected}
            />
          </div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col gap-2">
          {empty ? (
            <EmptyState
              icon={<Database />}
              title={t("dialog.emptyTitle")}
              description={t("dialog.emptyDescription")}
              className="flex-1"
            />
          ) : (
            <>
              <CodeWarnings warnings={output.warnings} />
              {file && <CodePreview file={file} />}
            </>
          )}
        </section>
      </AppDialog>
      <OverwriteDialog request={overwrite} onAnswer={answer} />
    </>
  );
}
