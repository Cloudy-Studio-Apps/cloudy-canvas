import { resolveVariable } from "@canvas";
import { groupLabel } from "../group-kinds";
import { useBoard } from "../use-board";
import { useVariablesWindowStore } from "../variables-window-store";
import { AddCardMenu } from "./add-card-menu";
import type { GroupSectionProps } from "./board.types";
import { CardGrid } from "./card-grid";
import { ColorCard } from "./color-card";
import { GroupTitle } from "./group-title";
import { NumberCard } from "./number-card";
import { PlainCard } from "./plain-card";

/** One group on the board: its title, its cards and the "+" card. */
export function GroupSection({ group, items }: GroupSectionProps) {
  const { store, shown } = useBoard();
  const selectedId = useVariablesWindowStore((state) => state.selectedId);
  const max = Math.max(
    1,
    ...items.map((v) => {
      const value = resolveVariable(store, v.id, shown[0]?.context ?? {});
      return value?.type === "number" ? value.number : 0;
    }),
  );
  return (
    <section data-group={group}>
      <GroupTitle group={group} count={items.length} label={groupLabel(store, items)} />
      <CardGrid>
        {items.map((v) =>
          v.type === "number" ? (
            <NumberCard
              key={v.id}
              variable={v}
              shown={shown}
              max={max}
              selected={v.id === selectedId}
            />
          ) : v.type === "color" ? (
            <ColorCard key={v.id} variable={v} shown={shown} selected={v.id === selectedId} />
          ) : (
            <PlainCard key={v.id} variable={v} shown={shown} selected={v.id === selectedId} />
          ),
        )}
        <AddCardMenu group={group} items={items} />
      </CardGrid>
    </section>
  );
}
