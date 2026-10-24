import type { BrochurePage, DesignNode, FrameElement, ImagePaint } from "@design";

export interface PageSectionProps {
  page: BrochurePage;
}

export interface PageImagesSectionProps {
  frame: FrameElement;
}

export interface PageImageRowProps {
  node: DesignNode;
  paint: ImagePaint;
}

export interface LooseFrameSectionProps {
  frame: FrameElement;
}

export interface FramesSectionProps {
  frames: readonly FrameElement[];
}

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface SettingChoice<T extends string> {
  value: T;
  label: string;
}

export interface SettingSelectProps<T extends string> {
  label: string;
  value: T;
  choices: readonly SettingChoice<T>[];
  onChange: (value: T) => void;
}
