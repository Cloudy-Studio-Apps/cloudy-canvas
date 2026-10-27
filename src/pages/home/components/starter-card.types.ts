import type { HomeStarter } from "../use-starters.types";

export interface StarterCardProps {
  starter: HomeStarter;
  onSelect: () => void;
}
