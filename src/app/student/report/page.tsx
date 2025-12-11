
"use client"

import { StudentReport } from "@/components/student/student-report";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EyeOff } from "lucide-react";

export default function ReportPage() {
  const { studentGame } = useStudentGame();

  if (studentGame?.isBlindRound) {
    return (
       <StudentGate>
          <Alert variant="destructive">
            <EyeOff className="h-4 w-4" />
            <AlertTitle className="font-bold">Funcionalidad Desactivada</AlertTitle>
            <AlertDescription>
              El reporte de ronda no está disponible durante una ronda a ciegas para mantener el desafío.
            </AlertDescription>
          </Alert>
       </StudentGate>
    )
  }

  return (
    <StudentGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Reporte de Ronda</h1>
          <p className="text-muted-foreground">
            Análisis de tu rendimiento en la ronda actual proporcionado por el profesor.
          </p>
        </div>
        <StudentReport />
      </div>
    </StudentGate>
  );
}
