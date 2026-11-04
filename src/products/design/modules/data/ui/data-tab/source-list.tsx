import { SourceRow } from "./source-row";
import type { SourceListProps } from "./source-list.types";
import { t } from "../../data.i18n";

/** The design's data sources, in order. */
export function SourceList({ sources, types, issues, onOpen }: SourceListProps) {
  return (
    <ul aria-label={t("tab.sources")} className="flex flex-col gap-0.5 px-1.5 pb-2">
      {sources.map((source) => (
        <SourceRow
          key={source.id}
          source={source}
          sourceType={types.find((type) => type.id === source.sourceType)}
          issues={issues.filter((issue) => issue.sourceId === source.id)}
          onOpen={() => onOpen(source.id)}
        />
      ))}
    </ul>
  );
}
