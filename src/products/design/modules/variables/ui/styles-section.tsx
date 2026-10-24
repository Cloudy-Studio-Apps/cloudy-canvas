import { Plus } from "lucide-react";
import { useState } from "react";

import { groupTree } from "@canvas";
import {
  ExtensionIconView,
  TokenGroupAccordion,
  useDocumentTokens,
  useEditorModules,
} from "@canvas-ui";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { DeleteTokensDialog, StyleRow } from "@design/ui/components/styles";
import { designStyleTypes } from "@design/ui/modules/style-types";

/**
 * With nothing selected, Figma's Styles: "+" adds a style of a kind (Text, …), and each kind's
 * styles are listed under their heading, in their groups. Click one to edit it.
 */
export function StylesSection() {
  const engine = useDesignEngine();
  const { host } = useEditorModules();
  const { store } = useDocumentTokens();
  const types = [...host.get(designStyleTypes)].sort((a, b) => a.order - b.order);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string[] | null>(null);
  if (types.length === 0) return null;

  return (
    <PanelSection
      title="Styles"
      actions={
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Add style"
            title="Add style"
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
          >
            <Plus />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {types.map((type) => (
              <DropdownMenuItem key={type.id} onSelect={() => setEditingId(type.create(engine))}>
                <ExtensionIconView icon={type.icon} /> {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="flex flex-col gap-2">
        {types.map((type) => {
          const styles = store.styles(type.id);
          if (styles.length === 0) return null;
          return (
            <div key={type.id} className="flex flex-col">
              <p className="pt-1 pb-1.5 text-xs text-muted-foreground">{type.heading}</p>
              <TokenGroupAccordion
                group={groupTree(styles)}
                storageKey={`styles:${type.id}`}
                renderVariable={(style) => (
                  <StyleRow
                    style={style}
                    editing={editingId === style.id}
                    setEditing={(open) => setEditingId(open ? style.id : null)}
                    onDelete={() => {
                      setEditingId(null);
                      setDeleting([style.id]);
                    }}
                  />
                )}
              />
            </div>
          );
        })}
        {store.styles().length === 0 && (
          <p className="text-xs text-muted-foreground">Save looks you reuse as styles.</p>
        )}
      </div>
      <DeleteTokensDialog ids={deleting} onClose={() => setDeleting(null)} />
    </PanelSection>
  );
}
