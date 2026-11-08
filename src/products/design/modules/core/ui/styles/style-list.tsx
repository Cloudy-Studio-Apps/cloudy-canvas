import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";

import { tokenLeafOf, type StyleRecord } from "@canvas";
import {
  groupBySource,
  LibraryBadge,
  TokenSourceHeader,
  useDocumentTokens,
  useTokenSources,
} from "@canvas-ui";
import { ListRow, SearchInput } from "@shared/ui/kit";
import { shownStyle } from "./shown-style";
import { StylePreview } from "./style-preview";
import type { StyleListProps } from "./styles.types";
import { useStyleType } from "./use-style-type";
import { t } from "../../core.i18n";

/** Past this many styles, the list gets a search field. */
const SEARCH_FROM = 8;

/**
 * The file's styles of one type to pick from (a section's style button). In a file using project
 * libraries, grouped by where they come from: each library (its styles marked), then the file's.
 */
export function StyleList({ styleType, current, onPick }: StyleListProps) {
  const { store } = useDocumentTokens();
  const entry = useStyleType(styleType);
  const [query, setQuery] = useState("");
  const styles = store.styles(styleType);
  const shown = query
    ? styles.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
    : styles;
  const sources = useTokenSources(styles);
  if (styles.length === 0) {
    return <p className="px-2 py-2 text-xs text-muted-foreground">{t("styles.none")}</p>;
  }
  const row = (style: StyleRecord, badge?: ReactNode) => (
    <ListRow
      key={style.id}
      icon={<StylePreview style={style} />}
      label={
        badge ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate">{tokenLeafOf(style.name)}</span>
            {badge}
          </span>
        ) : (
          tokenLeafOf(style.name)
        )
      }
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
  );
  return (
    <div className="flex flex-col gap-1">
      {styles.length > SEARCH_FROM && (
        <SearchInput value={query} onChange={setQuery} size="sm" placeholder={t("styles.search")} />
      )}
      <div className="flex max-h-64 flex-col overflow-y-auto">
        {sources
          ? groupBySource(shown, sources).map(({ source, items }) => (
              <div key={source.libraryId ?? "file"} className="flex flex-col">
                <TokenSourceHeader source={source} note={false} className="px-2 pt-1" />
                {items.map((style) =>
                  row(style, source.libraryId ? <LibraryBadge name={source.name} /> : undefined),
                )}
              </div>
            ))
          : shown.map((style) => row(style))}
      </div>
    </div>
  );
}
