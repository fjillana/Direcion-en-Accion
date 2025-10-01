import { Leaderboard } from "@/components/student/leaderboard";
import { StudentGate } from "@/components/student/student-gate";

export default function LeaderboardPage() {
  return (
    <StudentGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
          <p className="text-muted-foreground">
            Compara el rendimiento de tu equipo con los demás.
          </p>
        </div>
        <Leaderboard />
      </div>
    </StudentGate>
  );
}
