
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Edit, Check, Loader2, Users, School, UserX } from "lucide-react";
import { useState } from "react";

type TeamName = "Equipo Alfa" | "Equipo Beta" | "Equipo Gamma" | "Equipo Delta" | "IA Rival 1" | "IA Rival 2";

type TeamPerformance = {
  name: TeamName;
  type: 'H' | 'IA';
};


interface AIReportFormProps {
  teamsData: TeamPerformance[];
}

const initialReportData = {
  financialSummary: {
    round: 3,
    income: "320,000 CC",
    personnelCost: "245,000 CC",
    investments: "35,000 CC",
    roundResult: "40,000 CC",
    cashFlow: "65,000 CC",
  },
  kpiSummary: {
    cash: "65,000 CC",
    personnelCost: "76.5%",
    nma: "8.7",
    marketShare: "14.2%",
    morale: "82%",
    studentTeacherRatio: "24.5",
  },
  marketAttractiveness: {
    newStudents: 25,
    centerCapacity: 800,
    lostStudents: 0,
  },
  qualitativeAnalysis:
    "El equipo ha gestionado eficientemente la crisis de la huelga, optando por una negociación parcial que ha contenido la caída de moral sin un coste excesivo. La inversión en TIC ha sido clave para mejorar la NMA, y se refleja positivamente en el IAM. Sin embargo, el coste de personal ha subido al 76.5%, superando el umbral del 75%. Es crucial vigilar este indicador en la próxima ronda para no comprometer la viabilidad financiera a largo plazo.",
};

export function AIReportForm({ teamsData }: AIReportFormProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamName>(teamsData[0].name);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [report, setReport] = useState(initialReportData.qualitativeAnalysis);
  const [hasReport, setHasReport] = useState(true); // Default to true for demo

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReport(initialReportData.qualitativeAnalysis);
      setHasReport(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value as TeamName);
    // In a real app, you would fetch the report for the selected team
    // For now, we reset the state
    setHasReport(true); // Assuming all teams have a report for demo
    setReport(initialReportData.qualitativeAnalysis);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="text-primary" />
              Reporte y Sugerencias (IA)
            </CardTitle>
            <CardDescription>
              Genera o edita el informe de rendimiento para cada equipo.
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <Select onValueChange={handleTeamChange} defaultValue={selectedTeam}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                {teamsData.map((team) => (
                  <SelectItem key={team.name} value={team.name}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasReport ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Financial Summary */}
              <div>
                <h3 className="font-semibold mb-2">Resumen Financiero (Ronda {initialReportData.financialSummary.round})</h3>
                <div className="rounded-lg border p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Ingresos:</span> <span className="font-mono">{initialReportData.financialSummary.income}</span></div>
                  <div className="flex justify-between"><span>Coste Personal:</span> <span className="font-mono text-red-500">- {initialReportData.financialSummary.personnelCost}</span></div>
                  <div className="flex justify-between"><span>Inversiones:</span> <span className="font-mono text-red-500">- {initialReportData.financialSummary.investments}</span></div>
                  <div className="flex justify-between font-bold border-t pt-2"><span>Resultado Ronda:</span> <span className="font-mono">{initialReportData.financialSummary.roundResult}</span></div>
                  <div className="flex justify-between font-bold"><span>Tesorería Final:</span> <span className="font-mono">{initialReportData.financialSummary.cashFlow}</span></div>
                </div>
              </div>

              {/* KPI Summary */}
              <div>
                 <h3 className="font-semibold mb-2">KPIs Finales</h3>
                 <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Saldo Tesorería:</span><span className="font-mono">{initialReportData.kpiSummary.cash}</span></div>
                    <div className="flex justify-between"><span>Coste Personal/Ingreso:</span><span className="font-mono">{initialReportData.kpiSummary.personnelCost}</span></div>
                    <div className="flex justify-between"><span>Nota Media Alumnado:</span><span className="font-mono">{initialReportData.kpiSummary.nma}</span></div>
                    <div className="flex justify-between"><span>Cuota de Mercado:</span><span className="font-mono">{initialReportData.kpiSummary.marketShare}</span></div>
                    <div className="flex justify-between"><span>Moral Personal:</span><span className="font-mono">{initialReportData.kpiSummary.morale}</span></div>
                    <div className="flex justify-between"><span>Ratio Alumnos/Profesor:</span><span className="font-mono">{initialReportData.kpiSummary.studentTeacherRatio}</span></div>
                 </div>
              </div>
              {/* Market Attractiveness */}
               <div>
                 <h3 className="font-semibold mb-2">Captación y Capacidad (MAM)</h3>
                 <div className="rounded-lg border p-4 space-y-4 text-sm">
                    <div className="flex items-center gap-4">
                        <Users className="h-6 w-6 text-blue-500" />
                        <div className="flex flex-1 justify-between"><span>Nuevos Alumnos Captados:</span><span className="font-mono font-bold">{initialReportData.marketAttractiveness.newStudents}</span></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <School className="h-6 w-6 text-gray-500" />
                        <div className="flex flex-1 justify-between"><span>Capacidad del Centro:</span><span className="font-mono">{initialReportData.marketAttractiveness.centerCapacity}</span></div>
                    </div>
                     <div className="flex items-center gap-4">
                        <UserX className="h-6 w-6 text-red-500" />
                        <div className="flex flex-1 justify-between"><span>Alumnos Perdidos:</span><span className="font-mono text-red-500 font-bold">{initialReportData.marketAttractiveness.lostStudents}</span></div>
                    </div>
                 </div>
              </div>
            </div>

            {/* AI Qualitative Analysis */}
            <div className="space-y-2">
              <Label htmlFor="qualitative-analysis" className="text-base font-semibold">
                Análisis Cualitativo (sugerido por IA)
              </Label>
              <Textarea
                id="qualitative-analysis"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                readOnly={!isEditing}
                className="min-h-[150px] leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <Button onClick={() => setIsEditing(false)}>
                  <Check className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
              )}
              <Button>Publicar Reporte al Equipo</Button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              Aún no se ha generado un reporte para {selectedTeam}.
            </p>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "Generando..." : `Generar Reporte para ${selectedTeam}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    