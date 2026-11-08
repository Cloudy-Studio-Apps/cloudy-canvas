import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

import { NumberField } from "@design/ui/components/panel";
import { SegmentedControl, SelectField } from "@shared/ui/kit";
import {
  MAX_TRANSITION_DURATION,
  PROTOTYPE_ANIMATIONS,
  PROTOTYPE_EASINGS,
} from "../../prototype.constants";
import { t } from "../../prototype.i18n";
import { InteractionRow } from "./interaction-row";
import type { InteractionFieldsProps } from "./interaction-fields.types";

const ANIMATION_CHOICES = PROTOTYPE_ANIMATIONS.map((value) => ({
  value,
  label: t(`animation.${value}`),
}));

const EASING_CHOICES = PROTOTYPE_EASINGS.map((value) => ({
  value,
  label: t(`easing.${value}`),
}));

/** The animations that move something, so they have a direction. */
const DIRECTIONAL = ["move-in", "move-out", "push", "slide-in", "slide-out"];

/** The direction choices, as the mockup words them: `left` means it comes in from the right. */
const DIRECTION_CHOICES = [
  { value: "left", label: t("direction.left"), icon: <ArrowLeft /> },
  { value: "right", label: t("direction.right"), icon: <ArrowRight /> },
  { value: "up", label: t("direction.up"), icon: <ArrowUp /> },
  { value: "down", label: t("direction.down"), icon: <ArrowDown /> },
] as const;

/** The transition's animation, its direction, and its time and easing (unless it's instant). */
export function TransitionFields({ ix, onChange }: InteractionFieldsProps) {
  const { transition } = ix;
  const change = (patch: Partial<typeof transition>) =>
    onChange({ transition: { ...transition, ...patch } });
  return (
    <div className="flex flex-col gap-2 border-t pt-2">
      <InteractionRow label={t("card.animation")}>
        <SelectField
          label={t("card.animation")}
          value={transition.animation}
          options={ANIMATION_CHOICES}
          onChange={(animation) => change({ animation })}
        />
      </InteractionRow>
      {DIRECTIONAL.includes(transition.animation) && (
        <InteractionRow label={t("card.from")}>
          <SegmentedControl
            label={t("card.from")}
            iconOnly
            size="sm"
            fullWidth
            value={transition.direction}
            options={DIRECTION_CHOICES}
            onChange={(direction) => change({ direction })}
          />
        </InteractionRow>
      )}
      {transition.animation !== "instant" && (
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            prefix="ms"
            label={t("card.duration")}
            value={transition.duration}
            min={0}
            max={MAX_TRANSITION_DURATION}
            step={50}
            decimals={0}
            onCommit={(duration) => change({ duration })}
          />
          <SelectField
            label={t("card.easing")}
            value={transition.easing}
            options={EASING_CHOICES}
            onChange={(easing) => change({ easing })}
          />
        </div>
      )}
    </div>
  );
}
