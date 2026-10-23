import { PropertyGrid } from "@design/ui/components/panel";
import { EffectColorField, ScrubField } from "@design/modules/effects/ui/fields";
import type { ShaderParamFieldProps } from "./shader-ui.types";

/** A shader parameter's control, as its note says: a slider, a color, a point or numbers. */
export function ShaderParamField({ param, value, onChange }: ShaderParamFieldProps) {
  const name = param.name.replace(/^u(?=[A-Z])/, "");
  if (param.kind === "color") {
    const hex = `#${value
      .slice(0, 3)
      .map((c) =>
        Math.round(Math.min(Math.max(c, 0), 1) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
    return (
      <EffectColorField
        label={name}
        color={hex}
        opacity={param.type === "vec4" ? (value[3] ?? 1) : undefined}
        onChange={(next, info) => {
          const channels = [1, 3, 5].map((i) => parseInt(next.color.slice(i, i + 2), 16) / 255);
          onChange(param.type === "vec4" ? [...channels, next.opacity] : channels, info);
        }}
      />
    );
  }
  if (param.kind === "range") {
    const span = (param.max ?? 1) - (param.min ?? 0);
    return (
      <ScrubField
        prefix={name.slice(0, 3)}
        label={name}
        value={value[0] ?? 0}
        min={param.min}
        max={param.max}
        step={span > 0 ? span / 200 : 0.01}
        onChange={(v, info) => onChange([v], info)}
      />
    );
  }
  const axes = ["x", "y", "z", "w"];
  return (
    <PropertyGrid>
      {value.map((component, i) => (
        <ScrubField
          key={axes[i]}
          prefix={`${name.slice(0, 2)}${value.length > 1 ? axes[i] : ""}`}
          label={`${name} ${axes[i]}`}
          value={component}
          step={param.kind === "point" ? 0.01 : 0.1}
          onChange={(v, info) =>
            onChange(
              value.map((c, j) => (j === i ? v : c)),
              info,
            )
          }
        />
      ))}
    </PropertyGrid>
  );
}
