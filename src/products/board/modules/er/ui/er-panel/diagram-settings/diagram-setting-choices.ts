import type { ErSettingChoice } from "./diagram-settings.types";
import { t } from "../../../er.i18n";

/** The diagram settings page, top to bottom. */
export const ER_SETTING_CHOICES: readonly ErSettingChoice[] = [
  {
    key: "style",
    label: t("settingChoices.attributes.label"),
    hint: t("settingChoices.attributes.hint"),
    options: [
      { value: "ellipse", label: t("settingChoices.attributes.ellipse") },
      { value: "lollipop", label: t("settingChoices.attributes.lollipop") },
    ],
  },
  {
    key: "cardinality",
    label: t("settingChoices.cardinality.label"),
    hint: t("settingChoices.cardinality.hint"),
    options: [
      { value: "minmax", label: t("settingChoices.cardinality.minmax") },
      { value: "ratio", label: t("settingChoices.cardinality.ratio") },
    ],
  },
  {
    key: "ratio",
    label: t("settingChoices.ratio.label"),
    hint: t("settingChoices.ratio.hint"),
    options: [
      { value: "across", label: t("settingChoices.ratio.across") },
      { value: "own", label: t("settingChoices.ratio.own") },
    ],
  },
  {
    key: "participation",
    label: t("settingChoices.participation.label"),
    hint: t("settingChoices.participation.hint"),
    options: [
      { value: "numbers", label: t("settingChoices.participation.numbers") },
      { value: "lines", label: t("settingChoices.participation.lines") },
      { value: "both", label: t("settingChoices.participation.both") },
    ],
  },
  {
    key: "isa",
    label: t("settingChoices.isa.label"),
    hint: t("settingChoices.isa.hint"),
    options: [
      { value: "arc", label: t("settingChoices.isa.arc") },
      { value: "circle", label: t("settingChoices.isa.circle") },
      { value: "arrow", label: t("settingChoices.isa.arrow") },
    ],
  },
  {
    key: "arrows",
    label: t("settingChoices.arrows.label"),
    hint: t("settingChoices.arrows.hint"),
    options: [
      { value: "manual", label: t("settingChoices.arrows.manual") },
      { value: "cardinality", label: t("settingChoices.arrows.cardinality") },
    ],
  },
  {
    key: "joins",
    label: t("settingChoices.joins.label"),
    hint: t("settingChoices.joins.hint"),
    options: [
      { value: "shown", label: t("settingChoices.joins.shown") },
      { value: "hidden", label: t("settingChoices.joins.hidden") },
    ],
  },
  {
    key: "dependency",
    label: t("settingChoices.dependency.label"),
    hint: t("settingChoices.dependency.hint"),
    options: [
      { value: "marks", label: t("settingChoices.dependency.marks") },
      { value: "none", label: t("settingChoices.dependency.none") },
    ],
  },
  {
    key: "crowFeet",
    label: t("settingChoices.crowFeet.label"),
    hint: t("settingChoices.crowFeet.hint"),
    options: [
      { value: "on", label: t("settingChoices.crowFeet.on") },
      { value: "off", label: t("settingChoices.crowFeet.off") },
    ],
  },
];
