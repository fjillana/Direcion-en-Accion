
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, School, UserX, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGame } from "@/hooks/use-game-context";


export function StudentReport() {
  const { activeGame } = useGame();
  
  // Assuming the student is part of "Equipo Beta" for now. This would be dynamic in a real app.
  const teamName = "Equipo Beta";
  
  const reportData = activeGame?.reports?.[activeGame.round -1]?.[teamName];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>
              Análisis de Rendimiento - {teamName}
            </CardTitle>
            <CardDescription>
              Este es el feedback generado por el profesor y la IA sobre vuestro desempeño en la ronda anterior.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {reportData ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Financial Summary */}
              <div>
                <h3 className="font-semibold mb-2">Resumen Financiero (Ronda {reportData.financialSummary.round})</h3>
                <div className="rounded-lg border p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Ingresos:</span> <span className="font-mono">{reportData.financialSummary.income.toLocaleString('es-ES')} CC</span></div>
                  <div className="flex justify-between"><span>Coste Personal:</span> <span className="font-mono text-red-500">- {reportData.financialSummary.personnelCost.toLocaleString('es-ES')} CC</span></div>
                  <div className="flex justify-between"><span>Inversiones:</span> <span className="font-mono text-red-500">- {reportData.financialSummary.investmentsCost.toLocaleString('es-ES')} CC</span></div>
                  <div className="flex justify-between font-bold border-t pt-2"><span>Resultado Ronda:</span> <span className="font-mono">{reportData.financialSummary.roundResult.toLocaleString('es-ES')} CC</span></div>
                  <div className="flex justify-between font-bold"><span>Tesorería Final:</span> <span className="font-mono">{reportData.financialSummary.cashFlow.toLocaleString('es-ES')} CC</span></div>
                </div>
              </div>

              {/* KPI Summary */}
              <div>
                 <h3 className="font-semibold mb-2">KPIs Finales</h3>
                 <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Saldo Tesorería:</span><span className="font-mono">{reportData.kpiSummary.cash}</span></div>
                    <div className="flex justify-between"><span>Coste Personal/Ingreso:</span><span className="font-mono">{reportData.kpiSummary.personnelCost}</span></div>
                    <div className="flex justify-between"><span>Nota Media Alumnado:</span><span className="font-mono">{reportData.kpiSummary.nma}</span></div>
                    <div className="flex justify-between"><span>Cuota de Mercado:</span><span className="font-mono">{reportData.kpiSummary.marketShare}</span></div>
                    <div className="flex justify-between"><span>Moral Personal:</span><span className="font-mono">{reportData.kpiSummary.morale}</span></div>
                    <div className="flex justify-between"><span>Ratio Alumnos/Profesor:</span><span className="font-mono">{reportData.kpiSummary.studentTeacherRatio}</span></div>
                 </div>
              </div>
              {/* Market Attractiveness */}
               <div>
                 <h3 className="font-semibold mb-2">Captación y Capacidad (MAM)</h3>
                 <div className="rounded-lg border p-4 space-y-4 text-sm">
                    <div className="flex items-center gap-4">
                        <Users className="h-6 w-6 text-blue-500" />
                        <div className="flex flex-1 justify-between"><span>Nuevos Alumnos Captados:</span><span className="font-mono font-bold">{reportData.marketAttractiveness.newStudents}</span></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <School className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-1 justify-between"><span>Capacidad del Centro:</span><span className="font-mono">{reportData.financialDetail.numStudents * 1.1}</span></div>
                    </div>
                     <div className="flex items-center gap-4">
                        <UserX className="h-6 w-6 text-red-500" />
                        <div className="flex flex-1 justify-between"><span>Alumnos Perdidos:</span><span className="font-mono text-red-500 font-bold">{reportData.marketAttractiveness.lostStudents}</span></div>
                    </div>
                 </div>
              </div>
            </div>

            {/* AI Qualitative Analysis */}
            <div className="space-y-2">
              <Label htmlFor="qualitative-analysis" className="text-base font-semibold">
                Análisis y Sugerencias del Profesor
              </Label>
              <Textarea
                id="qualitative-analysis"
                value={reportData.qualitativeAnalysis}
                readOnly
                className="min-h-[150px] leading-relaxed bg-muted/30"
              />
            </div>
          </>
        ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <Info className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-semibold">Reporte No Disponible</h3>
                <p className="text-muted-foreground">El reporte para esta ronda aún no ha sido publicado por el profesor.</p>
            </div>
        )}
        
      </CardContent>
    </Card>
  );
}
