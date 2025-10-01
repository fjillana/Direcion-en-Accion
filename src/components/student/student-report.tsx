
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, School, UserX } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


const reportData = {
  financialSummary: {
    round: 2,
    income: "310,000 CC",
    personnelCost: "240,000 CC",
    investments: "25,000 CC",
    roundResult: "45,000 CC",
    cashFlow: "70,000 CC",
  },
  kpiSummary: {
    cash: "70,000 CC",
    personnelCost: "77.4%",
    nma: "8.5",
    marketShare: "13.5%",
    morale: "78%",
    studentTeacherRatio: "24.0",
  },
  marketAttractiveness: {
    newStudents: 20,
    centerCapacity: 800,
    lostStudents: 5,
  },
  qualitativeAnalysis:
    "El equipo ha gestionado eficientemente la crisis de la huelga, optando por una negociación parcial que ha contenido la caída de moral sin un coste excesivo. La inversión en TIC ha sido clave para mejorar la NMA, y se refleja positivamente en el IAM. Sin embargo, el coste de personal ha subido al 77.4%, superando el umbral del 75%. Es crucial vigilar este indicador en la próxima ronda para no comprometer la viabilidad financiera a largo plazo.",
};

export function StudentReport() {

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>
              Análisis de Rendimiento - Equipo Beta
            </CardTitle>
            <CardDescription>
              Este es el feedback generado por el profesor y la IA sobre vuestro desempeño en la ronda anterior.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Financial Summary */}
              <div>
                <h3 className="font-semibold mb-2">Resumen Financiero (Ronda {reportData.financialSummary.round})</h3>
                <div className="rounded-lg border p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Ingresos:</span> <span className="font-mono">{reportData.financialSummary.income}</span></div>
                  <div className="flex justify-between"><span>Coste Personal:</span> <span className="font-mono text-red-500">- {reportData.financialSummary.personnelCost}</span></div>
                  <div className="flex justify-between"><span>Inversiones:</span> <span className="font-mono text-red-500">- {reportData.financialSummary.investments}</span></div>
                  <div className="flex justify-between font-bold border-t pt-2"><span>Resultado Ronda:</span> <span className="font-mono">{reportData.financialSummary.roundResult}</span></div>
                  <div className="flex justify-between font-bold"><span>Tesorería Final:</span> <span className="font-mono">{reportData.financialSummary.cashFlow}</span></div>
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
                        <div className="flex flex-1 justify-between"><span>Capacidad del Centro:</span><span className="font-mono">{reportData.marketAttractiveness.centerCapacity}</span></div>
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
        
      </CardContent>
    </Card>
  );
}
