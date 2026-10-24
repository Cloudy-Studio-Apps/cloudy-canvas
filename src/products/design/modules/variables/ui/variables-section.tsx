import { Table2 } from "lucide-react";
import { useState } from "react";

import { useDocumentTokens } from "@canvas-ui";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { DeleteVariablesDialog } from "./delete-variables-dialog";
import { NewVariableMenu } from "./new-variable-menu";
import { GlobalModes } from "./global-modes";
import { SidebarGroups } from "./sidebar-groups";
import { usePageModes } from "./use-page-modes";

/**
 * With nothing selected, Figma's way: the file's mode switches, "Local variables" (the table),
 * then each collection's groups as the Variables window's outline shows them, unfolding to their
 * variables (click one to edit it). "+" adds one of a type.
 */
export function VariablesSection() {
  const engine = useDesignEngine();
  const { store } = useDocumentTokens();
  const { modes } = usePageModes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const remove = (ids: string[]) => {
    setEditingId(null);
    setDeleting(ids);
  };
  const list = { modes, editingId, setEditingId, onDelete: remove };

  return (
    <PanelSection title="Variables" actions={<NewVariableMenu onCreated={setEditingId} />}>
      <div className="flex flex-col gap-2">
        <GlobalModes />
        <button
          type="button"
          onClick={() => engine.commands.openVariables?.()}
          className="flex h-7 items-center gap-2 rounded-md px-1.5 text-left text-xs hover:bg-muted"
        >
          <Table2 className="size-3.5 text-muted-foreground" />
          Local variables
        </button>
        {!store.isEmpty && (
          <>
            <SidebarGroups {...list} />
          </>
        )}
      </div>
      <DeleteVariablesDialog ids={deleting} onClose={() => setDeleting(null)} />
    </PanelSection>
  );
}
