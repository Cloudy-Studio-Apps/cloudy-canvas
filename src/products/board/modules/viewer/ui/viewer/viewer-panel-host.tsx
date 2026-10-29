import type { ViewerPanelHostProps } from "./viewer-panel-host.types";

/** The right-hand side panel, showing the open part's `panel`. */
export function ViewerPanelHost({ open, data, onClose }: ViewerPanelHostProps) {
  const Panel = open.part.panel;
  if (!Panel) return null;
  return (
    <aside className="pointer-events-auto absolute top-3 right-3 bottom-3 w-96 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border bg-surface shadow-md">
      <Panel data={data} element={open.element} close={onClose} />
    </aside>
  );
}
