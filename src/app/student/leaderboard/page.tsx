import { Leaderboard } from "@/components/student/leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
        <p className="text-muted-foreground">
          Compara el rendimiento de tu equipo con los demás.
        </p>
      </div>
      <Leaderboard />
    </div>
  );
}
