

import { StudentReport } from "@/components/student/student-report";
import { StudentGate } from "@/components/student/student-gate";

export default function ReportPage() {
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
