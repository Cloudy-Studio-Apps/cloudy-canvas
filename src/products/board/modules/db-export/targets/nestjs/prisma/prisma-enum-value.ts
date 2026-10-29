const IDENTIFIER = /^[A-Za-z][A-Za-z0-9_]*$/;

/** An enum value as a Prisma identifier: itself when it is one, else letters, digits and `_`. */
export function prismaEnumValue(value: string): string {
  if (IDENTIFIER.test(value)) return value;
  const cleaned = value.replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  return /^[A-Za-z]/.test(cleaned) ? cleaned : `v_${cleaned}`;
}
