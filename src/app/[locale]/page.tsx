import { getMatches } from "@/lib/matches";
import HeroSection from "@/components/home/HeroSection";
import FeatureCards from "@/components/home/FeatureCards";
import UpcomingMatches from "@/components/home/UpcomingMatches";

export default async function HomePage() {
  const { upcoming } = await getMatches();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeatureCards />
      <UpcomingMatches matches={upcoming} />
      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  );
}
