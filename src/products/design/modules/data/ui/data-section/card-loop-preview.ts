import type { CanvasDocument, CanvasElement } from "@canvas";

import { isDesignNode, type DesignNode } from "../../../core";
import { isFrame, type FrameElement } from "../../../frame";
import type { DataPreviewStep } from "../../data.points.types";
import {
  childrenMap,
  dataCopyTag,
  DEFAULT_DESIGN_LIMIT,
  repeatOf,
  setRepeat,
  templateOf,
  type ScopeLayer,
} from "../../repeat";
import type { CardLoopPreview } from "./card-loop-preview.types";
import { t } from "../../data.i18n";

const byIndex = (a: DesignNode, b: DesignNode) =>
  a.index < b.index ? -1 : a.index > b.index ? 1 : 0;

/**
 * Whether `nodeId` shows `frame`'s preview row: the way up from it reaches the frame through its
 * template (not a copy), and the frame isn't itself a copy (its repeat follows its template's).
 */
function showsPreview(doc: CanvasDocument, frame: FrameElement, nodeId: string): boolean {
  if (dataCopyTag(frame)) return false;
  const seen = new Set<string>();
  for (let at: CanvasElement | undefined = doc.get(nodeId); at && !seen.has(at.id);) {
    seen.add(at.id);
    if (!isDesignNode(at) || !at.parentId) return false;
    if (at.parentId === frame.id) {
      const children = [...(childrenMap(doc).get(frame.id) ?? [])].sort(byIndex);
      return templateOf(frame, children)?.id === at.id;
    }
    at = doc.get(at.parentId);
  }
  return false;
}

/**
 * A card repeater's loop around a layer (`layer.owner` a frame with a repeat), for In scope:
 * "Card repeater in <frame>", and from its template (or a layer in it) a stepper over the rows
 * shown while designing, writing the frame's `previewRow` with `setRepeat`. `null` when the owner
 * isn't a card repeater.
 */
export function cardLoopPreview(
  doc: CanvasDocument,
  layer: ScopeLayer,
  nodeId: string,
): CardLoopPreview | null {
  const frame = doc.get(layer.owner);
  if (!isFrame(frame)) return null;
  const repeat = repeatOf(frame);
  if (!repeat) return null;
  const count = Math.min(layer.count, repeat.designLimit ?? DEFAULT_DESIGN_LIMIT);
  const step: DataPreviewStep | null =
    !layer.unreadable && count > 0 && showsPreview(doc, frame, nodeId)
      ? {
          count,
          row: layer.index,
          set: (row) => setRepeat(doc, frame.id, { previewRow: row }),
        }
      : null;
  return { from: t("scope.from.card", { name: frame.name }), step };
}
