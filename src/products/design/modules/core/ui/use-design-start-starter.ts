import { useEditorModules, useStartStarter } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { designStarters } from "./core.points";

/** Fills a new design with the starter its link asks for (`/design/<id>?starter=mobile-app`). */
export function useDesignStartStarter(): void {
  useStartStarter(useDesignEngine(), useEditorModules().host.get(designStarters));
}
