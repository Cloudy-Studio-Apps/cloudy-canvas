/** A default written as a field initializer (`= 0L`), or as a comment when Java can't hold it. */
export interface JavaDefault {
  /** `" = 0L"`, or `""`. */
  init: string;
  /** `"default: now()"`, or `""`. */
  comment: string;
}
