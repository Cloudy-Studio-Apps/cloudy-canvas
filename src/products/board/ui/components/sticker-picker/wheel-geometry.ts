import { WHEEL_SLOTS } from "../../stores/sticker-recents-store";

/** The wheel's size and its rings, in CSS pixels. */
export const WHEEL = {
  size: 232,
  /** Distance from the center to the slots' centers. */
  slotRadius: 82,
  slotSize: 52,
  centerSize: 84,
} as const;

/** Where a slot's center is, relative to the wheel's center (slot 0 at the top, clockwise). */
export function slotOffset(
  slot: number,
  radius: number = WHEEL.slotRadius,
): { x: number; y: number } {
  const angle = (slot / WHEEL_SLOTS) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}
