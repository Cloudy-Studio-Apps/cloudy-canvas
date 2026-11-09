import { EmptyState } from "@shared/ui/kit";
import { LibraryStrip } from "@pages/shared/projects";
import { useProjectContext } from "../project-context";
import { KindBody } from "./kind-body";
import { LIBRARY_KINDS } from "./library-kinds";
import { kindCounts } from "./library-summary";
import { t } from "../project.i18n";

/** One kind across the project's libraries, grouped by library. */
export function ContentView() {
  const { kind, libs, manifest } = useProjectContext();
  const info = LIBRARY_KINDS.find((item) => item.kind === kind);
  if (!kind || !info) return null;
  const Icon = info.icon;

  if (kind === "components") {
    return (
      <EmptyState
        icon={<Icon />}
        title={t("libraries.componentsTitle")}
        description={t("libraries.componentsText")}
        className="mx-auto max-w-md py-16"
      />
    );
  }
  const holders = libs.summaries.filter((library) => kindCounts(library)[kind] > 0);
  return (
    <div className="space-y-6 p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Icon className="size-5 text-muted-foreground" />
        {t(`kinds.${kind}`)}
      </h2>
      {holders.length === 0 && (
        <EmptyState title={t(`libraries.empty.${kind}`)} className="mx-auto max-w-md py-12" />
      )}
      {holders.map((library) => {
        const colors = library.colors.slice(0, 4).map((item) => item.color);
        return (
          <section key={library.entry.id} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <LibraryStrip
                colors={colors.length > 0 ? colors : [manifest.color]}
                className="h-3.5 w-6 rounded-sm"
              />
              {library.entry.name}
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {kindCounts(library)[kind]}
              </span>
            </h3>
            <KindBody kind={kind} library={library} />
          </section>
        );
      })}
    </div>
  );
}
