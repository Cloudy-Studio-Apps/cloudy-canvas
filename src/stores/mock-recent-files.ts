import type { FileInfo } from "@core";
import { CURRENT_FORMAT_VERSION } from "@core";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const mock = (name: string, type: FileInfo["type"], updatedHoursAgo: number): FileInfo => ({
  id: crypto.randomUUID(),
  name,
  type,
  createdAt: hoursAgo(updatedHoursAgo + 72),
  updatedAt: hoursAgo(updatedHoursAgo),
  formatVersion: CURRENT_FORMAT_VERSION,
});

export const MOCK_RECENT_FILES: FileInfo[] = [
  mock("Sprint retro", "board", 0.2),
  mock("Onboarding flow", "design", 3),
  mock("Product roadmap Q3", "board", 26),
  mock("Marketing site v2", "design", 50),
  mock("User interview notes", "board", 120),
  mock("Icon exploration", "design", 400),
];
