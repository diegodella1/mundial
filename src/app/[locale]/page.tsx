import { getMatches } from "@/lib/matches";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import WhatIsMatchfeel from "@/components/home/WhatIsMatchfeel";
import FeatureCards from "@/components/home/FeatureCards";
import UpcomingMatches from "@/components/home/UpcomingMatches";
import FinalCTA from "@/components/home/FinalCTA";

export default async function HomePage() {
  const { upcoming } = await getMatches();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <WhatIsMatchfeel />
      <FeatureCards />
      <UpcomingMatches matches={upcoming} />
      <FinalCTA />
    </div>
  );
}
