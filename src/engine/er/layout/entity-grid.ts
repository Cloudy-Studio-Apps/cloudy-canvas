import type { ErShapes } from "../lang";
import { entityNeighbors } from "./er-graph";
import type { Cell } from "./layout.types";

/** Neighbouring cells in order of preference: right, down, left, up, then the diagonals. */
const DIRECTIONS: readonly Cell[] = [
  { c: 1, r: 0 },
  { c: 0, r: 1 },
  { c: -1, r: 0 },
  { c: 0, r: -1 },
  { c: 1, r: 1 },
  { c: -1, r: 1 },
  { c: 1, r: -1 },
  { c: -1, r: -1 },
];
const FAR_DIRECTIONS: readonly Cell[] = DIRECTIONS.map(({ c, r }) => ({ c: c * 2, r: r * 2 }));

/**
 * Puts every entity in a grid cell, next to the entities it shares relations with. Each connected
 * group is walked breadth-first from its busiest entity; groups sit side by side.
 */
export function entityGrid(shapes: ErShapes): Map<string, Cell> {
  const neighbors = entityNeighbors(shapes);
  const degree = (id: string) => neighbors.get(id)?.length ?? 0;
  const order = shapes.entities
    .map((entity, i) => ({ id: entity.id, i }))
    .sort((a, b) => degree(b.id) - degree(a.id) || a.i - b.i)
    .map((item) => item.id);

  const result = new Map<string, Cell>();
  let nextCol = 0;
  for (const start of order) {
    if (result.has(start)) continue;
    const group = placeGroup(start, neighbors, degree);
    const minCol = Math.min(...[...group.values()].map((cell) => cell.c));
    const minRow = Math.min(...[...group.values()].map((cell) => cell.r));
    let maxCol = nextCol;
    for (const [id, cell] of group) {
      const placed = { c: cell.c - minCol + nextCol, r: cell.r - minRow };
      result.set(id, placed);
      maxCol = Math.max(maxCol, placed.c);
    }
    nextCol = maxCol + 1;
  }
  return result;
}

function placeGroup(
  start: string,
  neighbors: ReadonlyMap<string, string[]>,
  degree: (id: string) => number,
): Map<string, Cell> {
  const cells = new Map<string, Cell>([[start, { c: 0, r: 0 }]]);
  const taken = new Set([key({ c: 0, r: 0 })]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift()!;
    const next = [...(neighbors.get(current) ?? [])]
      .filter((id) => !cells.has(id))
      .sort((a, b) => degree(b) - degree(a));
    for (const id of next) {
      const placedNeighbors = (neighbors.get(id) ?? [])
        .map((n) => cells.get(n))
        .filter((cell): cell is Cell => cell !== undefined);
      const cell = bestCell(placedNeighbors, taken);
      cells.set(id, cell);
      taken.add(key(cell));
      queue.push(id);
    }
  }
  return cells;
}

/** The free cell closest to all placed neighbours, avoiding lines through other entities. */
function bestCell(placed: readonly Cell[], taken: ReadonlySet<string>): Cell {
  let best: Cell | null = null;
  let bestScore = Infinity;
  const directions = [...DIRECTIONS, ...FAR_DIRECTIONS];
  for (const anchor of placed) {
    for (const [rank, dir] of directions.entries()) {
      const cell = { c: anchor.c + dir.c, r: anchor.r + dir.r };
      if (taken.has(key(cell))) continue;
      const score = scoreCell(cell, placed, taken) + rank * 0.01;
      if (score < bestScore) {
        bestScore = score;
        best = cell;
      }
    }
  }
  return best ?? { c: (placed[0]?.c ?? 0) + 1, r: placed[0]?.r ?? 0 };
}

function scoreCell(cell: Cell, placed: readonly Cell[], taken: ReadonlySet<string>): number {
  let score = 0;
  for (const other of placed) {
    const dc = Math.abs(cell.c - other.c);
    const dr = Math.abs(cell.r - other.r);
    score += dc + dr;
    if (dc > 0 && dr > 0) score += 0.4;
    // A straight line two cells long would run through whatever sits in the middle.
    if ((dc + dr) % 2 === 0 && (dc === 0 || dr === 0 || dc === dr)) {
      const mid = { c: (cell.c + other.c) / 2, r: (cell.r + other.r) / 2 };
      if (taken.has(key(mid))) score += 3;
    }
  }
  return score;
}

function key({ c, r }: Cell): string {
  return `${c},${r}`;
}
