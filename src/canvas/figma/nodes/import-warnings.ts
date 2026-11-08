import type { ImportWarning } from "./import-warnings.types";

/**
 * What the import couldn't bring over as it was, counted per kind of loss. Losses are message
 * codes, not text: the import runs in a worker, which has no locale, so the product words them
 * on the main thread (`importWarningLines`).
 */
export class ImportWarnings<Code extends string = string> {
  private readonly counts = new Map<string, ImportWarning<Code>>();

  add(code: Code, values?: Readonly<Record<string, string>>): void {
    const key = values ? `${code} ${JSON.stringify(values)}` : code;
    const known = this.counts.get(key);
    if (known) known.count += 1;
    else this.counts.set(key, { code, ...(values && { values }), count: 1 });
  }

  /** Every kind of loss, in the order first met. */
  list(): ImportWarning<Code>[] {
    return [...this.counts.values()];
  }
}

/** One line per loss, worded by `text`: "3 × gradients became their first color". */
export function importWarningLines<Code extends string>(
  warnings: readonly ImportWarning<Code>[],
  text: (warning: ImportWarning<Code>) => string,
): string[] {
  return warnings.map((warning) => `${warning.count} × ${text(warning)}`);
}
