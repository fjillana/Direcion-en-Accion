
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CrisisDecision } from "@/hooks/use-games";
import { BookCheck } from "lucide-react";

interface CrisisReportProps {
  report: CrisisDecision;
}

export function CrisisReport({ report }: CrisisReportProps) {
  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BookCheck className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle className="text-blue-900 dark:text-blue-200">Reporte de la Crisis Anterior</CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Análisis de la crisis gestionada en la ronda anterior: "{report.crisisName}"
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Tu Decisión:</p>
          <blockquote className="border-l-2 border-blue-400 pl-4 italic text-muted-foreground">
            {report.option}
          </blockquote>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Tu Justificación:</p>
          <blockquote className="border-l-2 border-blue-400 pl-4 italic text-muted-foreground">
            "{report.justification}"
          </blockquote>
        </div>
         <div className="space-y-1 rounded-md bg-background p-3">
          <p className="text-sm font-semibold">Análisis y Consecuencias:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
             {report.outcomeDescription 
               ? report.outcomeDescription
               : `Esta decisión tuvo un impacto financiero de ${report.cost.toLocaleString('es-ES')} CC y afectó a tus puntos de experiencia y KPIs de la ronda. Revisa el reporte de ronda para un análisis completo.`
             }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
