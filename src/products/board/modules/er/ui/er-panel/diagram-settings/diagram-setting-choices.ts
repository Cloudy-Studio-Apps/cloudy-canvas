import type { ErSettingChoice } from "./diagram-settings.types";

/** The diagram settings page, top to bottom. */
export const ER_SETTING_CHOICES: readonly ErSettingChoice[] = [
  {
    key: "style",
    label: "Attributes",
    hint: "How attributes are drawn.",
    options: [
      { value: "ellipse", label: "Chen ellipses" },
      { value: "lollipop", label: "Lollipops" },
    ],
  },
  {
    key: "ratio",
    label: "Ratio on the diamond",
    hint: "For Cliente (0,n) and Pedido (1,1).",
    options: [
      { value: "across", label: "Read across" },
      { value: "own", label: "Own maximum" },
    ],
  },
  {
    key: "participation",
    label: "Participation",
    hint: "How a mandatory side (minimum 1) shows.",
    options: [
      { value: "numbers", label: "Numbers" },
      { value: "lines", label: "Double line" },
      { value: "both", label: "Both" },
    ],
  },
  {
    key: "isa",
    label: "Hierarchies",
    hint: "The specialization symbol.",
    options: [
      { value: "arc", label: "Triangle" },
      { value: "circle", label: "Circle d / o" },
    ],
  },
  {
    key: "crowFeet",
    label: "Crow's feet",
    hint: "Marks where two-way relations meet entities.",
    options: [
      { value: "on", label: "Shown" },
      { value: "off", label: "Hidden" },
    ],
  },
];
