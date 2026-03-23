import { getAllMatches } from "@/lib/matches";
import MatchesClient from "./MatchesClient";

export default async function MatchesPage() {
  const matches = await getAllMatches();

  // Extract unique groups for filter tabs
  const groups = Array.from(
    new Set(matches.map((m) => m.group_name).filter(Boolean))
  ).sort() as string[];

  return <MatchesClient matches={matches} groups={groups} />;
}
