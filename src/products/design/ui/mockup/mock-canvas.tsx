import type { MockCanvasProps } from "./mock-canvas.types";
import { MOCK_FRAMES } from "./mock-data";
import { MockFrameView } from "./mock-frame-view";

/** Static stand-in for the canvas: the page's frames, centered. Click empty space to deselect. */
export function MockCanvas({ selectedId, onSelect }: MockCanvasProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-surface-sunken"
      onClick={() => onSelect(null)}
    >
      <div className="relative" style={{ width: 660, height: 435 }}>
        {MOCK_FRAMES.map((frame) => (
          <MockFrameView
            key={frame.id}
            frame={frame}
            selected={frame.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
