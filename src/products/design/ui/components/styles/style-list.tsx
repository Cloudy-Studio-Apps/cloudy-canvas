import { Check } from "lucide-react";
import { useState } from "react";

import { tokenLeafOf } from "@canvas";
import { useDocumentTokens } from "@canvas-ui";
import { ListRow, SearchInput } from "@shared/ui/kit";
import { shownStyle } from "./shown-style";
import { StylePreview } from "./style-preview";
import type { StyleListProps } from "./styles.types";
import { useStyleType } from "./use-style-type";

/** Past this many styles, the list gets a search field. */
const SEARCH_FROM = 8;

/** The file's styles of one type to pick from (a section's style button). */
export function StyleList({ styleType, current, onPick }: StyleListProps) {
  const { store } = useDocumentTokens();
  const entry = useStyleType(styleType);
  const [query, setQuery] = useState("");
  const styles = store.styles(styleType);
  const shown = query
    ? styles.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
    : styles;
  if (styles.length === 0) {
    return <p className="px-2 py-2 text-xs text-muted-foreground">No styles of this kind yet.</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      {styles.length > SEARCH_FROM && (
        <SearchInput value={query} onChange={setQuery} size="sm" placeholder="Search styles" />
      )}
      <div className="flex max-h-64 flex-col overflow-y-auto">
        {shown.map((style) => (
          <ListRow
            key={style.id}
            icon={<StylePreview style={style} />}
            label={tokenLeafOf(style.name)}
            title={style.name}
            meta={
              style.id === current ? (
                <Check className="size-3.5 text-primary" />
              ) : (
                entry?.summary(shownStyle(store, style))
              )
            }
            selected={style.id === current}
            onSelect={() => onPick(style.id)}
          />
        ))}
      </div>
    </div>
  );
}
