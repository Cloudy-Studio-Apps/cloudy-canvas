import { groupTree } from "@canvas";
import { LibraryBadge, TokenGroupAccordion, TokenSourceHeader } from "@canvas-ui";
import { StyleRow } from "../../core/ui";
import { MoveToLibraryMenu } from "./move-to-library-menu";
import type { StyleSourceListProps } from "./variables-ui.types";

/**
 * The styles of one source in the Styles section (all of them in a file without libraries): each
 * type's under its heading, in their groups. A library's styles carry its badge and, while it
 * can't be edited, open no editor; the file's own move to a library from their right-click menu.
 */
export function StyleSourceList({
  source,
  styles,
  types,
  editingId,
  setEditingId,
  onDelete,
}: StyleSourceListProps) {
  const readOnly = source?.editable === false;
  return (
    <div className="flex flex-col gap-2">
      {source && <TokenSourceHeader source={source} />}
      {types.map((type) => {
        const ofType = styles.filter((style) => style.styleType === type.id);
        if (ofType.length === 0) return null;
        return (
          <div key={type.id} className="flex flex-col">
            <p className="pt-1 pb-1.5 text-xs text-muted-foreground">{type.heading}</p>
            <TokenGroupAccordion
              group={groupTree(ofType)}
              storageKey={`styles:${type.id}${source?.libraryId ? `:${source.libraryId}` : ""}`}
              renderVariable={(style) => (
                <MoveToLibraryMenu ids={[style.id]}>
                  <StyleRow
                    style={style}
                    readOnly={readOnly}
                    badge={source?.libraryId ? <LibraryBadge name={source.name} /> : undefined}
                    editing={editingId === style.id}
                    setEditing={(open) => setEditingId(open ? style.id : null)}
                    onDelete={() => onDelete(style.id)}
                  />
                </MoveToLibraryMenu>
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
