// Token names rendered by the preview page. Values come from the active theme (src/shared/core/themes/).

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const SCALES = [
  { name: "ice", role: "Primary — the sky behind the seal" },
  { name: "seal", role: "Neutral — belly, spots and outline" },
  { name: "blush", role: "Accent — the cheeks" },
  { name: "sand", role: "Board files" },
  { name: "lilac", role: "Design files" },
] as const;

export const SEMANTIC_GROUPS: { title: string; tokens: string[] }[] = [
  {
    title: "Surfaces & text",
    tokens: [
      "background",
      "surface",
      "surface-sunken",
      "muted",
      "hover",
      "foreground",
      "muted-foreground",
      "subtle-foreground",
    ],
  },
  { title: "Lines", tokens: ["border", "border-strong", "input", "ring"] },
  {
    title: "Roles",
    tokens: [
      "primary",
      "primary-soft",
      "secondary",
      "accent",
      "accent-soft",
      "board",
      "board-soft",
      "design",
      "design-soft",
    ],
  },
  {
    title: "Status",
    tokens: [
      "success",
      "success-soft",
      "warning",
      "warning-soft",
      "destructive",
      "destructive-soft",
    ],
  },
];

export const TYPE_SCALE = [
  { token: "text-3xl", className: "text-3xl font-semibold tracking-tighter", size: "30px" },
  { token: "text-2xl", className: "text-2xl font-semibold tracking-tight", size: "24px" },
  { token: "text-xl", className: "text-xl font-semibold tracking-tight", size: "20px" },
  { token: "text-lg", className: "text-lg font-medium", size: "17px" },
  { token: "text-md", className: "text-md", size: "15px" },
  { token: "text-base", className: "text-base", size: "14px" },
  { token: "text-sm", className: "text-sm", size: "13px" },
  { token: "text-xs", className: "text-xs", size: "12px" },
] as const;

export const RADII = [
  { token: "rounded-none", className: "rounded-none", value: "0" },
  { token: "rounded-xs", className: "rounded-xs", value: "2px" },
  { token: "rounded-sm", className: "rounded-sm", value: "3px" },
  { token: "rounded-md", className: "rounded-md", value: "4px · controls" },
  { token: "rounded-card", className: "rounded-card", value: "6px · cards" },
  { token: "rounded-xl", className: "rounded-xl", value: "8px · max" },
] as const;

export const SHADOWS = [
  { token: "shadow-xs", className: "shadow-xs" },
  { token: "shadow-soft", className: "shadow-soft" },
  { token: "shadow-lifted", className: "shadow-lifted" },
  { token: "shadow-popover", className: "shadow-popover" },
] as const;
