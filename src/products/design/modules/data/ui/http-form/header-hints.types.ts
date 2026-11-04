/** A common header: its name, what it's for (a message key), its usual values. */
export interface HeaderHint {
  name: string;
  hint: HeaderHintKey;
  values: readonly string[];
  /** Its value is a key or a password: kept on this device by default. */
  secret?: boolean;
}

export type HeaderHintKey =
  | "accept"
  | "contentType"
  | "authorization"
  | "apiKey"
  | "acceptLanguage"
  | "cacheControl"
  | "userAgent"
  | "ifNoneMatch";
