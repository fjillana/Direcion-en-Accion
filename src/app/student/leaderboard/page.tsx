
"use client";

import { Leaderboard } from "@/components/student/leaderboard";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EyeOff } from "lucide-react";

export default function LeaderboardPage() {
  const { studentGame } = useStudentGame();
  
  if (studentGame?.isBlindRound) {
    return (
       <StudentGate>
          <Alert variant="destructive">
            <EyeOff className="h-4 w-4" />
            <AlertTitle className="font-bold">Funcionalidad Desactivada</AlertTitle>
            <AlertDescription>
              El leaderboard no está disponible durante una ronda a ciegas para mantener el desafío.
            </AlertDescription>
          </Alert>
       </StudentGate>
    )
  }

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
