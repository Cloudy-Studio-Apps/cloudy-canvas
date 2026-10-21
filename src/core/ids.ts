/** Globally unique id. Never use auto-increment ids: files and shapes must merge across devices/collaborators. */
export function createId(): string {
  return crypto.randomUUID();
}
