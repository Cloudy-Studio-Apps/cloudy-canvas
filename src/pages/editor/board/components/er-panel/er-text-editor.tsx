import { useEngine } from "../../engine/engine-context";
import { useErVersion } from "../../engine/use-er-version";
import { SourceEditor } from "../source-editor";
import { ErSyntaxHint } from "./er-syntax-hint";

/** The whole diagram as text, applied while typing. */
export function ErTextEditor() {
  const engine = useEngine();
  const version = useErVersion();
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <SourceEditor
        version={version}
        label="ER diagram text"
        hint="Matched by name, so renames keep their place. New shapes are placed automatically; entities a relation names are created when you leave the editor."
        read={() => engine.er.text()}
        apply={(text, commit) => engine.er.applyText(text, { createMissing: commit })}
      />
      <ErSyntaxHint />
    </div>
  );
}
