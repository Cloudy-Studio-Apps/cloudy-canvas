/** WebKit's trackpad gesture event (`gesturestart`, `gesturechange`, `gestureend`). */
export interface WebKitGestureEvent extends UIEvent {
  /** The pinch's size since it started: 1 at the start. */
  scale: number;
  clientX: number;
  clientY: number;
}
