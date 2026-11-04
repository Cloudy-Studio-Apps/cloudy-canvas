/** How a link signs in: nothing, an API key, an access token or a username and password. */
export type HttpAuth = "none" | "apikey" | "bearer" | "basic";

/** What a link sends: nothing, a web form, JSON or plain text. */
export type HttpBodyKind = "none" | "form" | "json" | "text";

/** A request built from a link's settings and secrets, ready to send. */
export interface HttpRequestPlan {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: string;
}
