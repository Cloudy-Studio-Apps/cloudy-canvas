import { PanelSection } from "@design/ui/components/panel";
import { useDesignEngine } from "@design/ui/design-engine-context";
import type { PropertySectionProps } from "@design/ui/modules";
import { isDesignNode } from "../../../core";
import { isFrame } from "../../../frame";
import { dataCopyTag, repeatOf } from "../../repeat";
import { useDataSources } from "../hooks/use-data-sources";
import { RepeatSettingsBlock } from "./repeat-settings";
import { RepeatStart } from "./repeat-start";
import { useSetRepeat } from "./use-set-repeat";
import { t } from "../../data.i18n";

/**
 * The selected frame's repeat: "Repeat for each row" when it has none, else its settings. A
 * copied iterator (an outer repeat made it) says to edit its template's repeat instead.
 */
export function RepeatSection({ selection: { nodes } }: PropertySectionProps) {
  const engine = useDesignEngine();
  // Rows come from the sources: follow their Updates.
  useDataSources();
  const frame = nodes[0];
  const apply = useSetRepeat(frame?.id ?? "");
  if (!frame || !isFrame(frame)) return null;
  const repeat = repeatOf(frame);
  const copied = dataCopyTag(frame) !== null;
  if (copied && !repeat) return null;

  return (
    <PanelSection title={t("repeat.title")}>
      {copied ? (
        <p className="text-xs text-muted-foreground">{t("repeat.copied")}</p>
      ) : repeat ? (
        <RepeatSettingsBlock frameId={frame.id} repeat={repeat} apply={apply} />
      ) : (
        <RepeatStart
          frameId={frame.id}
          hasLayer={engine.doc.all().some((el) => isDesignNode(el) && el.parentId === frame.id)}
          apply={apply}
        />
      )}
    </PanelSection>
  );
}
