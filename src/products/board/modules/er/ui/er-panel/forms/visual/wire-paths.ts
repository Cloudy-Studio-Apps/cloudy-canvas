import type { KeyWire } from "./key-wires.types";

const TICK = 5;
const FORK = 9;

/** The lines between rows inside `box`, in its pixels, as one SVG path. */
export function wirePaths(box: HTMLElement, wires: readonly KeyWire[]): string {
  const frame = box.getBoundingClientRect();
  const list = [...box.querySelectorAll<HTMLElement>("[data-row]")];
  const rows = new Map(list.map((row) => [row.dataset.row, row.getBoundingClientRect()]));
  const cards = new Map(list.map((row) => [row.dataset.row, row.parentElement]));
  const middle = frame.width / 2;
  return wires
    .flatMap((wire, i) => {
      const a = rows.get(wire.from);
      const b = rows.get(wire.to);
      if (!a || !b) return [];
      const fromLeft = a.left - frame.left + a.width / 2 < middle;
      const startX = (fromLeft ? a.right : a.left) - frame.left;
      const startY = a.top - frame.top + a.height / 2;
      const tick = `M${startX + (fromLeft ? TICK : -TICK)} ${startY - TICK}v${TICK * 2}`;
      const offset = (i - (wires.length - 1) / 2) * 6;
      if (b.top - frame.top > a.bottom - frame.top && b.width > a.width * 1.5) {
        // Down into a wide table under the cards: end on its top edge.
        const x = middle + (fromLeft ? -8 : 8) + offset / 2;
        const y = (cards.get(wire.to)?.getBoundingClientRect().top ?? b.top) - frame.top;
        return [`M${startX} ${startY}H${x}V${y}`, tick, fork(x, y, wire.many)];
      }
      const endX = b.left - frame.left;
      const endY = b.top - frame.top + b.height / 2;
      const end = wire.many
        ? `M${endX - FORK} ${endY}L${endX} ${endY - TICK}M${endX - FORK} ${endY}L${endX} ${endY + TICK}`
        : `M${endX - TICK} ${endY - TICK}v${TICK * 2}`;
      return [`M${startX} ${startY}H${middle + offset}V${endY}H${endX}`, tick, end];
    })
    .join("");
}

function fork(x: number, y: number, many: boolean): string {
  if (!many) return `M${x - TICK} ${y - TICK}h${TICK * 2}`;
  return `M${x} ${y - FORK}L${x - TICK} ${y}M${x} ${y - FORK}L${x + TICK} ${y}`;
}
