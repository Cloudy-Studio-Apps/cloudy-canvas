import { useEffect } from "react";

import { useIsPhone } from "@shared/ui/hooks/use-is-phone";
import { useDesignPanelStore } from "../stores/design-panel-store";

/** On a phone the editor opens with the panels closed, and one opening closes the other. */
export function usePhonePanels(): void {
  const phone = useIsPhone();
  useEffect(() => {
    if (!phone) return;
    useDesignPanelStore.setState({ leftOpen: false, rightOpen: false });
    return useDesignPanelStore.subscribe((state, previous) => {
      if (state.leftOpen && !previous.leftOpen) useDesignPanelStore.setState({ rightOpen: false });
      if (state.rightOpen && !previous.rightOpen) useDesignPanelStore.setState({ leftOpen: false });
    });
  }, [phone]);
}
