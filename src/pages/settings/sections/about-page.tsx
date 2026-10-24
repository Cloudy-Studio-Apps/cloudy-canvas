import { AboutSection } from "./about-section";
import { DedicationCard } from "./dedication-card";

/** The About page: the app's details, then Cloudy Studio's dedication. */
export function AboutPage() {
  return (
    <div className="space-y-6">
      <AboutSection />
      <DedicationCard />
    </div>
  );
}
