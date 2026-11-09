/** An engine's last work before its closing save, once started. */
export interface FinalWork {
  /** The engine it belongs to (compared by identity). */
  engine: object;
  /** Whether the work changed the document. */
  done: Promise<boolean>;
}
