import { repeatRuns, segmentOwner, type DesignBrochure } from "../model";

/**
 * A brochure's repeats as agents read them: for each repeating section or page (`section` or
 * `position` of its first template page), its settings, the pages it makes now, its pending ones
 * (counted, made at export) and how many copies were taken out by hand.
 */
export function describeRepeats(brochure: DesignBrochure) {
  const record = brochure.record();
  if (!record) return [];
  const pages = brochure.pages();
  const expansion = brochure.expansion();
  const runs = repeatRuns(record);
  return [...runs].flatMap(([id, run]) => {
    const section = record.sections.find((item) => item.id === id);
    const slot = record.slots.find((item) => item.id === id);
    const repeat = (section ?? slot)?.repeat;
    if (!repeat) return [];
    const mine = expansion.pages.filter((page) => page.path.some((s) => segmentOwner(s) === id));
    const first = pages.findIndex((page) => page.slot.id === run[0]);
    return [
      {
        ...(section ? { section: id, name: section.name } : { page: first + 1 }),
        position: first === -1 ? null : first + 1,
        source: repeat.source,
        as: repeat.as,
        key: repeat.key ?? null,
        filter: repeat.filter,
        sort: repeat.sort,
        limit: repeat.limit ?? null,
        designLimit: repeat.designLimit ?? null,
        previewRow: repeat.previewRow ?? 0,
        perPage: repeat.perPage ?? 1,
        made: mine.filter((page) => page.made).length,
        pending: mine.filter((page) => !page.made && page.printed).length,
        detachedCopies: repeat.detached.length,
        detachedPages: repeat.detachedPages?.length ?? 0,
      },
    ];
  });
}
