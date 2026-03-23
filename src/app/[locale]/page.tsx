import { getMatches } from "@/lib/matches";
import FixtureDrawer from "@/components/fixture/FixtureDrawer";

export default async function HomePage() {
  const { live, upcoming, finished } = await getMatches();

  return (
    <div className="min-h-screen">
      <FixtureDrawer live={live} upcoming={upcoming} finished={finished} />
    </div>
  );
}
