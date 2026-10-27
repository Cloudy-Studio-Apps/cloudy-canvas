import { useErDiagram, useErQuery, useErSelection, useErVersion } from "../model";
import { SourceEditor } from "@board/ui/components/source-editor";
import { erCompletions, erLanguage } from "../source";
import { ErSyntaxHint } from "./er-syntax-hint";
import { t } from "../../er.i18n";

/** The shown diagram as text, applied while typing; the selected shape's block is highlighted. */
export function ErTextEditor() {
  const diagram = useErDiagram();
  const version = useErVersion();
  const selectedId = useErSelection().id;
  const highlight = useErQuery(
    (shown) => (selectedId ? shown.textRange(selectedId) : null),
    selectedId ?? "",
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <SourceEditor
        // A fresh editor per diagram, so text typed for one is never applied to another.
        key={diagram.id}
        version={version}
        label={t("text.label")}
        language={erLanguage}
        completions={erCompletions}
        hint={t("text.hint")}
        read={() => diagram.text()}
        apply={(text, commit) => diagram.applyText(text, { createMissing: commit })}
        highlight={highlight}
      />
      <ErSyntaxHint />
    </div>
  );
}
