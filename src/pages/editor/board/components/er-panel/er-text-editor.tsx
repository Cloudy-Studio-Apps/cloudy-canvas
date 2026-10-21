import { useEngineState } from "../../engine/engine-context";
import { useErDiagram, useErQuery } from "../../engine/use-er-query";
import { useErVersion } from "../../engine/use-er-version";
import { SourceEditor } from "../source-editor";
import { ErSyntaxHint } from "./er-syntax-hint";

/** The shown diagram as text, applied while typing; the selected shape's block is highlighted. */
export function ErTextEditor() {
  const diagram = useErDiagram();
  const version = useErVersion();
  const selectedId = useEngineState((state) => state.selectedErId);
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
        label="ER diagram text"
        hint="Matched by name, so renames keep their place. New shapes are placed automatically; entities a relation names are created when you leave the editor."
        read={() => diagram.text()}
        apply={(text, commit) => diagram.applyText(text, { createMissing: commit })}
        highlight={highlight}
      />
      <ErSyntaxHint />
    </div>
  );
}
