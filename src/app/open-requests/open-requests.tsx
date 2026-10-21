import { useOpenRequests } from "./use-open-requests";

/** Opens files dropped on the window or passed by the OS. Renders nothing. */
export function OpenRequests() {
  useOpenRequests();
  return null;
}
