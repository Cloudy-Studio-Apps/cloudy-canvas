import { tokenLeafOf } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { ListRow } from "@shared/ui/kit";
import { StyleEditorPopover } from "./style-editor-popover";
import { shownStyle } from "./shown-style";
import { StylePreview } from "./style-preview";
import type { StyleRowProps } from "./styles.types";
import { useStyleType } from "./use-style-type";

/**
 * A style in the Styles section, Figma's way: its look, name and summary; click to edit it
 * (`readOnly`: only the row).
 */
export function StyleRow({ style, editing, setEditing, onDelete, readOnly, badge }: StyleRowProps) {
  const entry = useStyleType(style.styleType);
  const { store } = useDocumentTokens();
  const label = badge ? (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate">{tokenLeafOf(style.name)}</span>
      {badge}
    </span>
  ) : (
    tokenLeafOf(style.name)
  );
  const row = (
    <ListRow
      icon={<StylePreview style={style} />}
      label={label}
      meta={entry?.summary(shownStyle(store, style))}
      title={style.description || style.name}
      selected={!readOnly && editing}
      onSelect={readOnly ? undefined : () => setEditing(!editing)}
    />
  );
  if (readOnly) return row;
  return (
    <StyleEditorPopover style={style} open={editing} onOpenChange={setEditing} onDelete={onDelete}>
      {row}
    </StyleEditorPopover>
  );
}
