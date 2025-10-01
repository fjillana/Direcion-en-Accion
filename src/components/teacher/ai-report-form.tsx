
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Edit, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";

type TeamName = "Equipo Alfa" | "Equipo Beta" | "Equipo Gamma" | "Equipo Delta" | "IA Rival 1" | "IA Rival 2";

type TeamPerformance = {
  name: TeamName;
  type: 'H' | 'IA';
};


interface AIReportFormProps {
  teamsData: TeamPerformance[];
}

const initialReportData = {
  round: 3,
  financialSummary: {
    income: 320000,
    personnelCost: 245000,
    investmentsCost: 35000,
    roundResult: 40000,
    cashFlow: 65000,
  },
  financialDetail: {
    numStudents: 810,
    tuitionPrice: 395, // approx 320000 / 810
    investments: [
      { name: "Inversión en TIC", cost: 25000, effect: "+2 NMA, +5 Moral" },
      { name: "Formación docente", cost: 10000, effect: "+1 NMA, +10 Moral" },
    ],
  },
  kpiAnalysis: {
    personnelCost: {
      value: "76.5%",
      analysis: "El ratio ha aumentado ligeramente debido al mantenimiento de la plantilla mientras los ingresos se han estabilizado. No se han realizado contrataciones ni despidos esta ronda, por lo que el cambio es menor."
    },
    nma: {
      value: "8.7",
      analysis: "La nota media ha subido significativamente (+0.2) gracias a la 'Inversión en TIC' (R2) y la 'Formación docente' (P1), que mejoran la calidad de la enseñanza."
    },
    marketShare: {
      value: "14.2%",
      analysis: "La cuota de mercado ha crecido un 0.7% gracias a la mejora de la NMA, que ha aumentado el Índice de Atractividad de Mercado (IAM) del centro."
    },
    morale: {
      value: "82%",
      analysis: "La moral ha subido 4 puntos. La inversión en TIC y formación docente ha sido bien recibida por el personal. La ausencia de crisis también ha contribuido."
    },
    studentTeacherRatio: {
      value: "24.5",
      analysis: "El ratio se mantiene estable, ya que no se ha contratado ni despedido personal y el número de alumnos ha tenido una variación moderada."
    }
  },
  marketAttractiveness: {
    iam: "115",
    newStudents: 25,
    lostStudents: 5,
    analysis: "Tu NMA (8.7) y precio (118 CC) te han hecho más atractivo que la media (NMA 8.4, Precio 122 CC), permitiéndote captar un 35% del total de nuevos alumnos disponibles en el mercado."
  },
  qualitativeAnalysis:
    "El equipo ha gestionado eficientemente la crisis de la huelga, optando por una negociación parcial que ha contenido la caída de moral sin un coste excesivo. La inversión en TIC ha sido clave para mejorar la NMA, y se refleja positivamente en el IAM. Sin embargo, el coste de personal ha subido al 76.5%, superando el umbral del 75%. Es crucial vigilar este indicador en la próxima ronda para no comprometer la viabilidad financiera a largo plazo.",
};

export function AIReportForm({ teamsData }: AIReportFormProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamName>(teamsData[0].name);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportText, setReportText] = useState(initialReportData.qualitativeAnalysis);
  const [hasReport, setHasReport] = useState(true); // Default to true for demo

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReportText(initialReportData.qualitativeAnalysis);
      setHasReport(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value as TeamName);
    setHasReport(true); 
    setReportText(initialReportData.qualitativeAnalysis);
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value).replace('€', 'CC');


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
              Genera o edita el informe de rendimiento para cada equipo para la Ronda {initialReportData.round}.
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
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full space-y-4">
            
            {/* Resumen Financiero */}
            <AccordionItem value="item-1" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <h3 className="font-semibold text-lg">Resumen Financiero</h3>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="rounded-lg border p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Ingresos:</span> <span className="font-mono">{formatCurrency(initialReportData.financialSummary.income)}</span></div>
                  <div className="flex justify-between"><span>Coste Personal:</span> <span className="font-mono text-red-500">- {formatCurrency(initialReportData.financialSummary.personnelCost)}</span></div>
                  <div className="flex justify-between"><span>Inversiones:</span> <span className="font-mono text-red-500">- {formatCurrency(initialReportData.financialSummary.investmentsCost)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-2"><span>Resultado Ronda:</span> <span className="font-mono">{formatCurrency(initialReportData.financialSummary.roundResult)}</span></div>
                  <div className="flex justify-between font-bold"><span>Tesorería Final:</span> <span className="font-mono">{formatCurrency(initialReportData.financialSummary.cashFlow)}</span></div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Detalle Financiero */}
            <AccordionItem value="item-2" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                    <h3 className="font-semibold text-lg">Detalle Financiero</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Ingresos</h4>
                        <p className="text-sm text-muted-foreground">
                            {initialReportData.financialDetail.numStudents} alumnos x {formatCurrency(initialReportData.financialDetail.tuitionPrice)}/trimestre = <span className="font-bold text-foreground">{formatCurrency(initialReportData.financialSummary.income)}</span>
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Inversiones Realizadas</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {initialReportData.financialDetail.investments.map(inv => (
                                <li key={inv.name}>
                                    <span className="font-semibold">{inv.name}</span> ({formatCurrency(inv.cost)}): <span className="text-muted-foreground">Impacto -> {inv.effect}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </AccordionContent>
            </AccordionItem>

             {/* KPIs */}
            <AccordionItem value="item-3" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                    <h3 className="font-semibold text-lg">Análisis de KPIs</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 space-y-4">
                    {Object.entries(initialReportData.kpiAnalysis).map(([key, value]) => (
                        <div key={key}>
                            <h4 className="font-medium flex items-center gap-2">
                                {key === 'personnelCost' && 'Coste Personal / Ingresos'}
                                {key === 'nma' && 'Nota Media Alumnado'}
                                {key === 'marketShare' && 'Cuota de Mercado'}
                                {key === 'morale' && 'Moral del Personal'}
                                {key === 'studentTeacherRatio' && 'Ratio Alumnos/Profesor'}
                                <Badge variant="secondary">{value.value}</Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{value.analysis}</p>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
            
            {/* Captación y Capacidad */}
            <AccordionItem value="item-4" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                    <h3 className="font-semibold text-lg">Captación y Capacidad (IAM)</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">IAM</p>
                            <p className="text-2xl font-bold">{initialReportData.marketAttractiveness.iam}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Alumnos Captados</p>
                            <p className="text-2xl font-bold text-emerald-600">{initialReportData.marketAttractiveness.newStudents}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Alumnos Perdidos</p>
                            <p className="text-2xl font-bold text-red-600">{initialReportData.marketAttractiveness.lostStudents}</p>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-medium">Análisis de Mercado</h4>
                        <p className="text-sm text-muted-foreground mt-1">{initialReportData.marketAttractiveness.analysis}</p>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* AI Qualitative Analysis */}
            <AccordionItem value="item-5" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                     <h3 className="font-semibold text-lg">Análisis Cualitativo y Sugerencias</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="qualitative-analysis" className="text-base font-semibold sr-only">
                            Análisis Cualitativo (sugerido por IA)
                        </Label>
                        <Textarea
                            id="qualitative-analysis"
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            readOnly={!isEditing}
                            className="min-h-[150px] leading-relaxed bg-muted/50"
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
                </AccordionContent>
            </AccordionItem>
          </Accordion>
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

    