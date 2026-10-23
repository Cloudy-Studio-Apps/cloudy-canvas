/** How one field of a built-in effect is read from agents (`key` names it in errors). */
export type FieldReader = (value: unknown, key: string) => unknown;
