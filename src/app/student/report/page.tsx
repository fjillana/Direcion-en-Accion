
import { StudentReport } from "@/components/student/student-report";

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Reporte de la Ronda 2
        </h1>
        <p className="text-muted-foreground">
          Análisis de rendimiento y resultados financieros de la última ronda completada.
        </p>
      </div>
      <StudentReport />
    </div>
  );
}
