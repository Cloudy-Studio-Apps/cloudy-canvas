/** Anything listeners can be attached to (elements, window, document). */
export type ListenerTarget = Pick<EventTarget, "addEventListener" | "removeEventListener">;
