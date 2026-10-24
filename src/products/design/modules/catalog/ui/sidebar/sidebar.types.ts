import type { BrochurePage, FrameElement, PagePicture } from "@design";

export interface PageSectionProps {
  page: BrochurePage;
}

export interface PageImagesSectionProps {
  frame: FrameElement;
}

export interface PageImageRowProps {
  picture: PagePicture;
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
