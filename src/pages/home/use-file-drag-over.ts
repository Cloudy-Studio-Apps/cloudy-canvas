import { useEffect, useState } from "react";

import { fileOpenRequests } from "@platform";

/** Whether files are being dragged over the window right now. */
export function useFileDragOver(): boolean {
  const [over, setOver] = useState(false);
  useEffect(() => fileOpenRequests.onDragOver(setOver), []);
  return over;
}
