import type { TextDefaults } from "./text.types";

export const TEXT_DEFAULTS = {
  fontSize: 16,
  typography: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    fontStyle: "normal",
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  color: "#000000",
} as const satisfies TextDefaults;
