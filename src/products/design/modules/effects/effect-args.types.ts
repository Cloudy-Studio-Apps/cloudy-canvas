/** How one field of an effect is read from agents (`key` names it in errors). */
export type EffectFieldReader = (value: unknown, key: string) => unknown;
