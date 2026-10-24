import { Unlink } from "lucide-react";
import { useState } from "react";

import { tokenLeafOf } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { IconButton, ListRow } from "@shared/ui/kit";
import { DeleteTokensDialog } from "./delete-tokens-dialog";
import { StyleEditorPopover } from "./style-editor-popover";
import { shownStyle } from "./shown-style";
import { StylePreview } from "./style-preview";
import type { StyleChipProps } from "./styles.types";
import { useStyleType } from "./use-style-type";

/**
 * What a section shows while its field uses a style, instead of the field's own controls: the
 * style's look and name (click to edit it) and Detach. Different styles read "Mixed".
 */
export function StyleChip({ binding }: StyleChipProps) {
  const { store } = useDocumentTokens();
  const style = binding.bound ? store.style(binding.bound) : undefined;
  const entry = useStyleType(style?.styleType);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const detach = (
    <IconButton size="xs" label="Detach style" onClick={() => binding.bind(null)}>
      <Unlink />
    </IconButton>
  );

  if (!style) {
    return <ListRow label="Mixed styles" muted actions={detach} className="border border-border" />;
  }
  return (
    <>
      <StyleEditorPopover
        style={style}
        open={editing}
        onOpenChange={setEditing}
        onDelete={() => {
          setEditing(false);
          setDeleting([style.id]);
        }}
      >
        <ListRow
          icon={<StylePreview style={style} />}
          label={tokenLeafOf(style.name)}
          meta={entry?.summary(shownStyle(store, style))}
          title={style.description || style.name}
          selected={editing}
          onSelect={() => setEditing(!editing)}
          actions={detach}
          className="border border-border"
        />
      </StyleEditorPopover>
      <DeleteTokensDialog ids={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}
