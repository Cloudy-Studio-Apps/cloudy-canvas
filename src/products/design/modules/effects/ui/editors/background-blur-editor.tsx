import { Droplet } from "lucide-react";

import type { EffectEditorProps } from "@design/ui/modules";
import type { BackgroundBlurEffect } from "../../effect.types";
import { ScrubField } from "../fields";
import { EffectBind } from "../effect-bind";

/** A background blur: its radius, and a hint that it shows through translucent fills only. */
export function BackgroundBlurEditor({
  effect,
  onChange,
}: EffectEditorProps<BackgroundBlurEffect>) {
  return (
    <div className="flex flex-col gap-2">
      <EffectBind field="radius">
        <ScrubField
          prefix={<Droplet />}
          label="Blur"
          min={0}
          value={effect.radius}
          onChange={(radius, info) => onChange({ ...effect, radius }, info)}
        />
      </EffectBind>
      <p className="text-xs text-muted-foreground">
        Shows through the layer&apos;s translucent fills: lower a fill&apos;s opacity to see it.
      </p>
    </div>
  );
}
