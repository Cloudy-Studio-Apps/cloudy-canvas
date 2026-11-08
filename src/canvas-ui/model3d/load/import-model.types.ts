/** Reads a file the model refers to from where the model lives; `null` when it isn't there. */
export type SiblingReader = (name: string) => Promise<Uint8Array | null>;
