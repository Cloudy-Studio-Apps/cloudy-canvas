import { useNavigate } from "react-router";

import { useHotkey } from "@shared/ui/hooks/use-hotkey";
import { DesignEditorMockup } from "./mockup";

const ESCAPE = { key: "Escape" };

/**
 * `/design/:id`. Shows the static layout mockup until the design editor exists; it will mount a
 * `CanvasEngine` with the design product, like the board editor does with `getBoardProduct()`.
 */
export function DesignEditorPage() {
  const navigate = useNavigate();

  useHotkey(ESCAPE, () => void navigate("/"));

  return <DesignEditorMockup fileName="Untitled design" onHome={() => void navigate("/")} />;
}
