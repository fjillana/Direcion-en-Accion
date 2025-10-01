

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
import { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebriefingQuestions } from "./debriefing-questions";
import { useGames } from "@/hooks/use-games";
import { useGame } from "@/hooks/use-game-context";
import { useToast } from "@/hooks/use-toast";
import { generateRoundReport } from "@/ai/flows/generate-round-report";
import type { TeamPerformanceData } from "@/hooks/use-games";


type TeamName = string;

interface AIReportFormProps {
  teamsData: TeamPerformanceData[];
}

const initialReportData = {
  round: 3,
  kpis: {
    cash: 50000,
    personnelCost: 245000,
    income: 320000,
    privateIncome: 295000,
    publicIncome: 25000,
    numStudents: 810,
    tuitionPrice: 395, 
    numTeachers: 33,
    nma: 8.7,
    marketShare: 14.2,
    morale: 82,
    studentTeacherRatio: 24.5,
  },
  decisions: {
      investments: [
      { id: 'R2', name: "Inversión en TIC", cost: 25000, effect: "+2 NMA, +5 Moral" },
      { id: 'P1', name: "Formación docente", cost: 10000, effect: "+1 NMA, +10 Moral" },
    ],
  },
  kpiAnalysis: {
    personnelCost: {
      value: "76.5%",
      calculation: "(245.000 CC / 320.000 CC)",
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
      calculation: "(810 alumnos / 33 profesores)",
      analysis: "El ratio se mantiene estable, ya que no se ha contratado ni despedido personal y el número de alumnos ha tenido una variación moderada."
    }
  },
  marketAnalysis: {
    iam: "115",
    newStudentsCaptured: 25,
    newStudentsInMarket: 50,
    capacity: 810,
    finalStudents: 810,
  },
  qualitativeAnalysis:
    "El equipo ha gestionado eficientemente la crisis de la huelga, optando por una negociación parcial que ha contenido la caída de moral sin un coste excesivo. La inversión en TIC ha sido clave para mejorar la NMA, y se refleja positivamente en el IAM. Sin embargo, el coste de personal ha subido al 76.5%, superando el umbral del 75%. Es crucial vigilar este indicador en la próxima ronda para no comprometer la viabilidad financiera a largo plazo.",
  debriefingQuestions: [
      "Vuestra inversión en TIC (R2) ha mejorado la NMA un 0.2, pero vuestro coste de personal ha superado el 75%. ¿Creéis que el beneficio en reputación compensa el riesgo financiero que estáis asumiendo? ¿Qué haríais diferente la próxima ronda?",
      "Elegisteis 'Negociar un acuerdo parcial' en la crisis de la huelga. ¿Qué os llevó a esa decisión en lugar de una más drástica como 'Aceptar todas las demandas' o 'Mantener la postura'? ¿Cómo creéis que impactará en la moral a largo plazo?",
  ],
  pedagogicalSuggestions: "Fomenta la discusión sobre el equilibrio entre KPIs de reputación (NMA, cuota de mercado) y los KPIs financieros (tesorería, coste de personal). Usa el ejemplo del Equipo Gamma para ilustrar que una estrategia de precios altos puede funcionar si se acompaña de una fuerte inversión en calidad percibida (instalaciones)."
};

export function AIReportForm({ teamsData }: AIReportFormProps) {
  const { activeGame } = useGame();
  const { updateReport, getGameById } = useGames();
  const { toast } = useToast();

  const humanTeams = useMemo(() => teamsData.filter(t => t.type === 'H'), [teamsData]);

  const [selectedTeam, setSelectedTeam] = useState<TeamName | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [qualitativeAnalysis, setQualitativeAnalysis] = useState("");
  const [debriefingQuestions, setDebriefingQuestions] = useState<string[]>([]);
  const [pedagogicalSuggestions, setPedagogicalSuggestions] = useState("");
  
  const [hasReport, setHasReport] = useState(false);
  
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (!selectedTeam && humanTeams.length > 0) {
      setSelectedTeam(humanTeams[0].name);
    } else if (humanTeams.length === 0) {
      setSelectedTeam(undefined);
    }
  }, [humanTeams, selectedTeam]);


  useEffect(() => {
    if (activeGame && selectedTeam) {
        const gameData = getGameById(activeGame.id);
        const round = activeGame.round ? activeGame.round - 1 : 0;
        const report = gameData?.reports?.[round]?.[selectedTeam];
        if (report) {
            setQualitativeAnalysis(report.qualitativeAnalysis || "");
            setDebriefingQuestions(report.debriefingQuestions || []);
            setPedagogicalSuggestions(report.pedagogicalSuggestions || "");
            setReportData(report);
            setHasReport(true);
        } else {
            setHasReport(false);
            setQualitativeAnalysis("");
            setDebriefingQuestions([]);
            setPedagogicalSuggestions("");
            setReportData(null);
        }
    } else {
      setHasReport(false);
    }
  }, [selectedTeam, activeGame, getGameById]);


  const handleGenerateReport = async () => {
    if (!activeGame || !selectedTeam) return;
    
    const teamPerformance = teamsData.find(t => t.name === selectedTeam);
    if (!teamPerformance) {
        toast({
            variant: "destructive",
            title: "Error al generar el informe",
            description: "No se encontraron los datos de rendimiento para el equipo seleccionado.",
        });
        return;
    }

    setIsGenerating(true);
    try {
      const result = await generateRoundReport({
        gameId: activeGame.id,
        roundNumber: activeGame.round -1,
        teamPerformanceData: JSON.stringify(teamPerformance, null, 2),
        marketConditions: "Mercado estable, 50 nuevos alumnos disponibles.",
      });

      setQualitativeAnalysis(result.reporteCualitativo);
      setDebriefingQuestions(result.preguntasMayeuticas);
      setPedagogicalSuggestions(result.sugerenciasPedagogicas);
      
      const newReportData = {
          ...initialReportData, 
          qualitativeAnalysis: result.reporteCualitativo,
          debriefingQuestions: result.preguntasMayeuticas,
          pedagogicalSuggestions: result.sugerenciasPedagogicas,
          round: activeGame.round - 1,
          kpis: teamPerformance.kpis,
          decisions: teamPerformance.decisions,
      };

      setReportData(newReportData);
      setHasReport(true);

    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error al generar el informe",
        description: "No se pudo comunicar con el servicio de IA. Inténtalo de nuevo.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value as TeamName);
    setIsEditing(false);
  };

  const handlePublishReport = () => {
    if (!activeGame || !selectedTeam) return;
    
    const teamPerformance = teamsData.find(t => t.name === selectedTeam);
    if (!teamPerformance) return;

    const fullReportData = {
      ...initialReportData,
      round: activeGame.round - 1,
      kpis: teamPerformance.kpis,
      decisions: teamPerformance.decisions,
      qualitativeAnalysis: qualitativeAnalysis,
      debriefingQuestions: debriefingQuestions,
      pedagogicalSuggestions: pedagogicalSuggestions,
    };
    
    updateReport(activeGame.id, activeGame.round - 1, selectedTeam, fullReportData);

    toast({
      title: "Reporte Publicado",
      description: `El informe para ${selectedTeam} ha sido enviado a la sección del estudiante.`,
    });
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value).replace('€', 'CC');


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="text-primary" />
              Asistente de Reportes IA
            </CardTitle>
            <CardDescription>
              Genera y edita el informe de rendimiento y las preguntas de debriefing para cada equipo en la Ronda {activeGame?.round ? activeGame.round -1 : 'anterior'}.
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <Select onValueChange={handleTeamChange} value={selectedTeam}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                {humanTeams.length > 0 ? (
                  humanTeams.map((team) => (
                    <SelectItem key={team.name} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No hay equipos humanos
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis">Análisis de Ronda</TabsTrigger>
                <TabsTrigger value="debriefing">Debriefing IA</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
                 {hasReport && reportData ? (
                    <Accordion type="multiple" defaultValue={['item-1', 'item-kpi-summary', 'item-kpi-analysis', 'item-market-analysis', 'item-6']} className="w-full space-y-4 pt-4">
                        
                        <AccordionItem value="item-1" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Resumen Financiero</h3></AccordionTrigger>
                            <AccordionContent className="px-4 grid md:grid-cols-3 gap-4">
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Ingresos Totales:</span> <span>{formatCurrency(reportData.kpis.income)}</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Coste Personal:</span> <span className="text-destructive">{formatCurrency(reportData.kpis.personnelCost)}</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Coste Inversiones:</span> <span className="text-destructive">{formatCurrency((reportData.decisions?.investments || []).reduce((acc: number, inv: any) => acc + inv.cost, 0))}</span></Badge>
                                <Badge variant="outline" className="col-span-1 md:col-span-2 flex justify-between p-3 text-sm"><span>Resultado de la Ronda:</span> <span className={(reportData.kpis.income - reportData.kpis.personnelCost) > 0 ? 'text-emerald-600' : 'text-destructive'}>{formatCurrency(reportData.kpis.income - reportData.kpis.personnelCost)}</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm font-bold"><span>Tesorería Final:</span> <span>{formatCurrency(reportData.kpis.cash)}</span></Badge>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-financial-details" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Detalle Financiero y de Inversiones</h3></AccordionTrigger>
                            <AccordionContent className="px-4 space-y-4">
                                <div className="p-3 bg-muted/50 rounded-lg border">
                                    <h4 className="font-semibold">Cálculos Clave</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Ingreso Público: {formatCurrency(reportData.kpis.publicIncome)}</p>
                                    <p className="text-sm text-muted-foreground">Ingreso Privado: {reportData.kpis.numStudents} alumnos x {formatCurrency(reportData.decisions.tuitionPrice)} = {formatCurrency(reportData.kpis.privateIncome)}</p>
                                    <p className="text-sm text-muted-foreground">Coste Personal: {reportData.kpis.numTeachers} profesores x 7.500 CC = {formatCurrency(reportData.kpis.personnelCost)}</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg border">
                                    <h4 className="font-semibold">Inversiones Realizadas</h4>
                                    <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                        {(reportData.decisions.investments || []).map((inv: any, index: number) => (
                                            <li key={index}>{inv.name}: {formatCurrency(inv.cost)}</li>
                                        ))}
                                        {(reportData.decisions.investments || []).length === 0 && <li>No se realizaron inversiones esta ronda.</li>}
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        
                         <AccordionItem value="item-kpi-summary" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Resumen de KPIs</h3></AccordionTrigger>
                            <AccordionContent className="px-4 grid md:grid-cols-3 gap-4">
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Saldo de Tesorería:</span> <span className="font-bold">{formatCurrency(reportData.kpis.cash)}</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Coste Personal / Ingresos:</span> <span className="font-bold">{reportData.kpis.income ? ((reportData.kpis.personnelCost / reportData.kpis.income) * 100).toFixed(1) : '0.0'}%</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Nota Media Alumnado:</span> <span className="font-bold">{reportData.kpis.nma.toFixed(1)}</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Cuota de Mercado:</span> <span className="font-bold">{reportData.kpis.marketShare.toFixed(1)}%</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Moral del Personal:</span> <span className="font-bold">{reportData.kpis.morale.toFixed(0)}%</span></Badge>
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Ratio Alumnos/Profesor:</span> <span className="font-bold">{reportData.kpis.studentTeacherRatio.toFixed(1)}</span></Badge>
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-kpi-analysis" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Análisis de KPIs</h3></AccordionTrigger>
                            <AccordionContent className="px-4 grid md:grid-cols-2 gap-4">
                                {Object.entries(reportData.kpiAnalysis).map(([key, value]: [string, any]) => (
                                    <div key={key} className="p-3 bg-muted/50 rounded-lg border">
                                        <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                        <p className="text-sm text-muted-foreground mt-1"><span className="font-bold text-foreground">Valor: {value.value}</span> - {value.analysis}</p>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-market-analysis" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Análisis de Mercado (IAM)</h3></AccordionTrigger>
                            <AccordionContent className="px-4 grid md:grid-cols-3 gap-4">
                               <div className="p-3 bg-muted/50 rounded-lg border text-center">
                                 <p className="text-sm font-semibold text-muted-foreground">IAM (Índice Atractividad)</p>
                                 <p className="text-2xl font-bold">{reportData.marketAnalysis.iam}</p>
                               </div>
                               <div className="p-3 bg-muted/50 rounded-lg border text-center">
                                 <p className="text-sm font-semibold text-muted-foreground">Nuevos Alumnos Captados</p>
                                 <p className="text-2xl font-bold">{reportData.marketAnalysis.newStudentsCaptured}</p>
                               </div>
                               <div className="p-3 bg-muted/50 rounded-lg border text-center">
                                 <p className="text-sm font-semibold text-muted-foreground">Alumnos en Mercado</p>
                                 <p className="text-2xl font-bold">{reportData.marketAnalysis.newStudentsInMarket}</p>
                               </div>
                               <div className="p-3 bg-muted/50 rounded-lg border text-center">
                                 <p className="text-sm font-semibold text-muted-foreground">Capacidad / Alumnos Finales</p>
                                 <p className="text-2xl font-bold">{reportData.marketAnalysis.capacity} / {reportData.marketAnalysis.finalStudents}</p>
                               </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline">
                                <h3 className="font-semibold text-lg">Análisis Cualitativo y Sugerencias IA</h3>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="qualitative-analysis" className="text-base font-semibold sr-only">
                                        Análisis Cualitativo (sugerido por IA)
                                    </Label>
                                    <Textarea
                                        id="qualitative-analysis"
                                        value={qualitativeAnalysis}
                                        onChange={(e) => setQualitativeAnalysis(e.target.value)}
                                        readOnly={!isEditing}
                                        className="min-h-[250px] leading-relaxed bg-muted/50"
                                        placeholder="El análisis cualitativo generado por la IA aparecerá aquí..."
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
                                <Button onClick={handlePublishReport}>Publicar Reporte al Equipo</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                    {selectedTeam ? `Aún no se ha generado un reporte para ${selectedTeam}.` : "Selecciona un equipo para generar un reporte."}
                    </p>
                    <Button onClick={handleGenerateReport} disabled={isGenerating || !selectedTeam}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {isGenerating ? "Generando..." : `Generar Reporte para ${selectedTeam || ''}`}
                    </Button>
                </div>
                )}
            </TabsContent>
            <TabsContent value="debriefing">
                <DebriefingQuestions 
                    questions={debriefingQuestions}
                    suggestions={pedagogicalSuggestions}
                    onGenerate={handleGenerateReport}
                    isGenerating={isGenerating}
                />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
