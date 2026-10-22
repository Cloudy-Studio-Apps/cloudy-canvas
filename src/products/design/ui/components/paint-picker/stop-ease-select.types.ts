import type { StopEase } from "@canvas";

export interface StopEaseSelectProps {
  value: StopEase;
  onChange: (ease: StopEase) => void;
}
