import type * as React from "react";

export interface PictureHotProps {
  id?: string | undefined;
  label: string;
  children: React.ReactNode;
}

export interface PictureLabelProps {
  x: number;
  y: number;
  text: string;
}

export interface PictureBoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** The entity's outline color. */
  color?: string | undefined;
  /** The shape to select when clicked. */
  id?: string | undefined;
}

export interface PictureDiamondProps {
  cx: number;
  cy: number;
  w: number;
  h: number;
  label: string;
  id?: string | undefined;
}
