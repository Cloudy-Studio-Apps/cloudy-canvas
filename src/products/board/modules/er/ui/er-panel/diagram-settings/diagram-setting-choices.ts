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
    key: "cardinality",
    label: "Cardinality on the lines",
    hint: "What each line says about its side.",
    options: [
      { value: "minmax", label: "(min,max)" },
      { value: "ratio", label: "1 / N" },
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
      { value: "arrow", label: "Arrow" },
    ],
  },
  {
    key: "arrows",
    label: "Arrowheads",
    hint: "On two-way relations, at an entity the other side takes part with at most once.",
    options: [
      { value: "manual", label: "Only [arrow]" },
      { value: "cardinality", label: "From cardinality" },
    ],
  },
  {
    key: "joins",
    label: "Join attributes",
    hint: "The attribute a relation joins through, after the cardinality.",
    options: [
      { value: "shown", label: "Shown" },
      { value: "hidden", label: "Hidden" },
    ],
  },
  {
    key: "dependency",
    label: "Dependency marks",
    hint: "The I (identification) and E (existence) marks on relations.",
    options: [
      { value: "marks", label: "Shown" },
      { value: "none", label: "Hidden" },
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
