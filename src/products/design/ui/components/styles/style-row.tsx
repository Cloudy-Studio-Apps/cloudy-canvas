import { tokenLeafOf } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { ListRow } from "@shared/ui/kit";
import { StyleEditorPopover } from "./style-editor-popover";
import { shownStyle } from "./shown-style";
import { StylePreview } from "./style-preview";
import type { StyleRowProps } from "./styles.types";
import { useStyleType } from "./use-style-type";

/** A style in the Styles section, Figma's way: its look, name and summary; click to edit it. */
export function StyleRow({ style, editing, setEditing, onDelete }: StyleRowProps) {
  const entry = useStyleType(style.styleType);
  const { store } = useDocumentTokens();
  return (
    <StyleEditorPopover style={style} open={editing} onOpenChange={setEditing} onDelete={onDelete}>
      <ListRow
        icon={<StylePreview style={style} />}
        label={tokenLeafOf(style.name)}
        meta={entry?.summary(shownStyle(store, style))}
        title={style.description || style.name}
        selected={editing}
        onSelect={() => setEditing(!editing)}
      />
    </StyleEditorPopover>
  );
}
