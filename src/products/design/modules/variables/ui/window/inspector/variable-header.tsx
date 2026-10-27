import { tokenGroupOf, tokenLeafOf } from "@canvas";
import { CommitInput } from "@canvas-ui";
import { tCommon } from "@shared/core";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import type { InspectorPartProps } from "./inspector.types";
import { t } from "../../../variables.i18n";

/** The inspector's top: where the variable is (collection / group) and its name, renamed in place. */
export function VariableHeader({ variable }: InspectorPartProps) {
  const { tokens, store } = useBoard();
  const select = useVariablesWindowStore((state) => state.select);
  const group = tokenGroupOf(variable.name);
  const collection = store.collection(variable.collectionId);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between text-xs text-subtle-foreground">
        <span className="truncate">
          {collection?.name}
          {group ? ` / ${group}` : ""}
        </span>
        <button
          type="button"
          onClick={() => select(null)}
          className="hover:text-foreground"
          aria-label={tCommon("close")}
        >
          ✕
        </button>
      </div>
      <CommitInput
        aria-label={t("editor.name")}
        value={tokenLeafOf(variable.name)}
        onCommit={(leaf) =>
          tokens.updateVariable(variable.id, { name: group ? `${group}/${leaf}` : leaf })
        }
        className="-ml-1.5 h-8 border-transparent bg-transparent px-1.5 text-base font-semibold shadow-none hover:border-border"
      />
    </div>
  );
}
