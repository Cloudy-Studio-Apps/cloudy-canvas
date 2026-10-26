import type { ReactNode } from "react";

import { onColor } from "../..";
import { PreviewButton as B } from "./preview-button";
import type { PreviewProps } from "./preview.types";

const STATUS = [
  ["success", "Saved", "Your changes are live."],
  ["warning", "Almost full", "You've used 90% of your storage."],
  ["error", "Payment failed", "Check your card details."],
  ["info", "Heads up", "Maintenance on Sunday at 02:00."],
] as const;

/** A sheet of UI pieces: buttons, inputs, choices, tabs, badges, alerts and a card. */
export function ComponentsPreview({ p }: PreviewProps) {
  const { t, text, body, soft } = p;
  const group = (title: string, inner: ReactNode) => (
    <div
      className="rounded-lg p-4"
      style={{ background: t("surface"), border: `1px solid ${t("border")}` }}
    >
      <div
        className="mb-3 text-[11px] font-bold tracking-wide uppercase"
        style={{ color: t("muted-foreground") }}
      >
        {title}
      </div>
      {inner}
    </div>
  );
  const field = (
    label: string,
    value: string,
    color: string,
    ring = false,
    help?: [string, string],
  ) => (
    <div className="mb-3">
      <div className="mb-1 text-xs font-semibold">{label}</div>
      <div
        className="flex h-8.5 items-center rounded-md px-2.5 text-[13px]"
        style={{
          border: `1px solid ${color}`,
          background: t("background"),
          boxShadow: ring ? `0 0 0 3px color-mix(in oklch, ${color} 25%, transparent)` : undefined,
        }}
      >
        {value}
      </div>
      {help && (
        <div className="mt-1 text-xs" style={{ color: help[1] }}>
          {help[0]}
        </div>
      )}
    </div>
  );
  return (
    <div
      className="grid w-full max-w-[860px] gap-3 rounded-lg p-4"
      style={{
        background: t("background"),
        color: t("foreground"),
        fontFamily: body,
        border: `1px solid ${t("border")}`,
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      }}
    >
      {group(
        "Buttons",
        <div className="flex flex-wrap gap-2">
          <B bg={t("primary")} fg={t("primary-foreground")}>
            Primary
          </B>
          <B bg={t("primary-soft")} fg={t("primary")}>
            Secondary
          </B>
          <B bg={t("surface")} fg={t("foreground")} border={t("border")}>
            Outline
          </B>
          <B bg="transparent" fg={t("foreground")} border="transparent">
            Ghost
          </B>
          <B bg={t("error")} fg={onColor(t("error"))}>
            Delete
          </B>
          <B bg={t("accent")} fg={onColor(t("accent"))}>
            Accent
          </B>
        </div>,
      )}
      {group(
        "Inputs",
        <>
          {field("Name", "Ada Lovelace", t("border"))}
          {field("Email", "ada@", t("primary"), true)}
          {field("Password", "••••", t("error"), false, ["At least 8 characters", t("error")])}
        </>,
      )}
      {group(
        "Choices",
        <div className="flex flex-col gap-2.5 text-[13px]">
          <span className="flex items-center gap-2">
            <span
              className="grid size-4 place-items-center rounded-xs text-[11px]"
              style={{ background: t("primary"), color: t("primary-foreground") }}
            >
              ✓
            </span>
            Email me updates
          </span>
          <span className="flex items-center gap-2">
            <span className="size-4 rounded-xs" style={{ border: `1px solid ${t("border")}` }} />
            Weekly digest
          </span>
          <span className="flex items-center gap-2">
            <span
              className="relative h-4.5 w-7.5 rounded-full"
              style={{ background: t("primary") }}
            >
              <span
                className="absolute top-0.5 right-0.5 size-3.5 rounded-full"
                style={{ background: t("primary-foreground") }}
              />
            </span>
            Dark mode
          </span>
          <div className="mt-1 flex gap-3.5" style={{ borderBottom: `1px solid ${t("border")}` }}>
            <span
              className="py-1.5 font-semibold"
              style={{ borderBottom: `2px solid ${t("primary")}` }}
            >
              Overview
            </span>
            <span className="py-1.5" style={{ color: t("muted-foreground") }}>
              Activity
            </span>
            <span className="py-1.5" style={{ color: t("muted-foreground") }}>
              Settings
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS.map(([name]) => (
              <span
                key={name}
                className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                style={{ background: soft(name, 20), color: t(name) }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>,
      )}
      {group(
        "Alerts",
        <>
          {STATUS.map(([name, title, line]) => (
            <div
              key={name}
              className="mb-2 flex gap-2.5 rounded-lg px-3 py-2.5"
              style={{
                background: soft(name),
                border: `1px solid color-mix(in oklch, ${t(name)} 35%, transparent)`,
              }}
            >
              <span className="w-1 rounded-sm" style={{ background: t(name) }} />
              <div>
                <div className="text-[13px] font-semibold" style={{ color: t(name) }}>
                  {title}
                </div>
                <div className="text-xs">{line}</div>
              </div>
            </div>
          ))}
        </>,
      )}
      {group(
        "Card",
        <>
          <div style={text("xl", 22)}>Weekly report</div>
          <div className="mt-1 mb-3 text-[13px]" style={{ color: t("muted-foreground") }}>
            Your team shipped 12 changes.
          </div>
          <div className="h-1.5 rounded-sm" style={{ background: t("primary-soft") }}>
            <div className="h-full w-[64%] rounded-sm" style={{ background: t("primary") }} />
          </div>
        </>,
      )}
    </div>
  );
}
