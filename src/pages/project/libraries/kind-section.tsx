import { KindBody } from "./kind-body";
import type { KindBodyProps } from "./kind-body.types";
import { LIBRARY_KINDS } from "./library-kinds";
import { kindCounts } from "./library-summary";
import { t } from "../project.i18n";

/** One kind of a library's page: its heading with the count, then what the library holds of it. */
export function KindSection({ kind, library }: KindBodyProps) {
  const Icon = LIBRARY_KINDS.find((info) => info.kind === kind)?.icon;
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {t(`kinds.${kind}`)}
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {kindCounts(library)[kind]}
        </span>
      </h3>
      <KindBody kind={kind} library={library} />
    </section>
  );
}
