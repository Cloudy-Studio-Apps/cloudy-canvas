import { useProjectLibrariesState } from "../libraries";
import { tokenSources } from "./token-sources";
import type { TokenSource } from "./tokens.types";
import { t } from "./tokens.i18n";

/**
 * The sources of `records` for a list grouped by where its items come from (`tokenSources`):
 * library names from the project, library items editable only while its libraries are open
 * (`ready`) and that library could be read. `null` when none comes from a library: the list shows as one, as in a loose file.
 */
export function useTokenSources(records: readonly unknown[]): TokenSource[] | null {
  const { status, hub, libraries } = useProjectLibrariesState();
  const entries = hub?.entries() ?? [];
  const name = (id: string) =>
    entries.find((entry) => entry.id === id)?.name ??
    libraries.find((library) => library.id === id)?.name() ??
    t("source.library");
  const sources = tokenSources(
    records,
    entries.map((entry) => entry.id),
    name,
    (id) => status === "ready" && hub?.library(id) !== undefined,
  );
  return sources.some((source) => source.libraryId !== null) ? sources : null;
}
