import { useOpenRequests } from "./use-open-requests";

/** Opens files dropped on the window or passed by the OS, and `cloudy-canvas://` links. Renders nothing. */
export function OpenRequests() {
  useOpenRequests();
  return null;
}
