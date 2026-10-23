/** Reads one effect's own fields from an agent (`at` names it in errors); throws when invalid. */
export type EffectReader = (fields: Record<string, unknown>, at: string) => Record<string, unknown>;
