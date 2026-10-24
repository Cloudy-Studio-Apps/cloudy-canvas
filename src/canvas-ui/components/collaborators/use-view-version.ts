import { useEffect, useState } from "react";

import { useEngine } from "../../engine-context";

/**
 * A number that changes whenever something on screen may have moved (the camera, a resize, a
 * document change), so overlays that read element bounds draw again.
 */
export function useViewVersion(): number {
  const engine = useEngine();
  const [version, setVersion] = useState(0);
  useEffect(() => engine.onViewChange(() => setVersion((v) => v + 1)), [engine]);
  return version;
}
