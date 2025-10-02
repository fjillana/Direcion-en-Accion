

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
import { Wand2, Edit, Check, Loader2, Save, Send } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebriefingQuestions } from "./debriefing-questions";
import { useGames } from "@/hooks/use-games";
import { useGame } from "@/hooks/use-game-context";
import { useToast } from "@/hooks/use-toast";
import { generateRoundReport } from "@/ai/flows/generate-round-report";
import type { TeamPerformanceData } from "@/hooks/use-games";
import { calculateMarketAttractiveness } from "@/lib/game-logic/market-attractiveness";

type TeamName = string;

interface AIReportFormProps {
  teamsData: TeamPerformanceData[];
}

export function AIReportForm({ teamsData }: AIReportFormProps) {
  const { activeGame } = useGame();
  const { updateReport, getGameById } = useGames();
  const { toast } = useToast();

  const humanTeams = useMemo(() => teamsData.filter(t => t.type === 'H'), [teamsData]);

  const [selectedTeam, setSelectedTeam] = useState<TeamName | undefined>(
    humanTeams.length > 0 ? humanTeams[0].name : undefined
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [qualitativeAnalysis, setQualitativeAnalysis] = useState("");
  const [debriefingQuestions, setDebriefingQuestions] = useState<string[]>([]);
  const [pedagogicalSuggestions, setPedagogicalSuggestions] = useState("");
  
  const [hasReport, setHasReport] = useState(false);
  
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // This effect runs when the selected team or the game data changes.
    // It loads an existing report from the game state if available.
    if (activeGame && selectedTeam) {
        const gameData = getGameById(activeGame.id);
        const round = activeGame.round ? activeGame.round - 1 : 0;
        const existingReport = gameData?.reports?.[round]?.[selectedTeam];
        
        if (existingReport) {
            setReportData(existingReport);
            setQualitativeAnalysis(existingReport.qualitativeAnalysis || "");
            setDebriefingQuestions(existingReport.debriefingQuestions || []);
            setPedagogicalSuggestions(existingReport.pedagogicalSuggestions || "");
            setHasReport(true);
        } else {
            // Reset if no report is found for the selected team
            setHasReport(false);
            setReportData(null);
            setQualitativeAnalysis("");
            setDebriefingQuestions([]);
            setPedagogicalSuggestions("");
        }
    } else {
      setHasReport(false);
      setReportData(null);
    }
  }, [selectedTeam, activeGame, getGameById, teamsData]);

  useEffect(() => {
    if (!selectedTeam && humanTeams.length > 0) {
      setSelectedTeam(humanTeams[0].name);
    } else if (humanTeams.length === 0) {
      setSelectedTeam(undefined);
    }
  }, [humanTeams, selectedTeam]);


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
        roundNumber: activeGame.round - 1,
        teamPerformanceData: JSON.stringify({
          ...teamPerformance,
          decisions: {
            ...teamPerformance.decisions,
            investments: teamPerformance.decisions?.investments || [],
          }
        }, null, 2),
        marketConditions: `Mercado con ${activeGame.newStudentsPerRound} nuevos alumnos disponibles.`,
      });
      
      const marketResults = calculateMarketAttractiveness(teamsData.map(t => ({...t, kpis: t.kpis, decisions: t.decisions})), activeGame);
      const teamMarketResult = marketResults[selectedTeam];

      const newReportData = {
          round: activeGame.round - 1,
          kpis: teamPerformance.kpis,
          decisions: teamPerformance.decisions,
          kpiAnalysis: result.kpiAnalysis, // Use analysis from AI
          marketAnalysis: {
            iam: teamMarketResult.iam,
            newStudentsCaptured: teamMarketResult.newStudents,
            newStudentsInMarket: activeGame.newStudentsPerRound,
            capacity: 810, // Assuming static capacity for now
            finalStudents: Math.min(teamPerformance.kpis.numStudents + teamMarketResult.newStudents, 810),
          },
          qualitativeAnalysis: result.reporteCualitativo,
          debriefingQuestions: result.preguntasMayeuticas,
          pedagogicalSuggestions: result.sugerenciasPedagogicas,
      };

      setReportData(newReportData);
      setQualitativeAnalysis(result.reporteCualitativo);
      setDebriefingQuestions(result.preguntasMayeuticas);
      setPedagogicalSuggestions(result.sugerenciasPedagogicas);
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
  
  const saveReport = (publish: boolean) => {
    if (!activeGame || !selectedTeam || !reportData) return;
    
    const fullReportData = {
      ...reportData,
      qualitativeAnalysis,
      debriefingQuestions,
      pedagogicalSuggestions,
      published: publish, // Track if it's a draft or published
    };
    
    updateReport(activeGame.id, activeGame.round - 1, selectedTeam, fullReportData);

    toast({
      title: publish ? "Reporte Publicado" : "Borrador Guardado",
      description: `El informe para ${selectedTeam} ha sido ${publish ? 'publicado' : 'guardado como borrador'}.`,
    });

    if (isEditing) {
        setIsEditing(false);
    }
  }

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
                                    <p className="text-sm text-muted-foreground mt-1">Ingreso Público: {formatCurrency(reportData.kpis.publicIncome || 0)}</p>
                                    <p className="text-sm text-muted-foreground">Ingreso Privado: {reportData.kpis.numStudents} alumnos x {formatCurrency(reportData.decisions.tuitionPrice)} = {formatCurrency(reportData.kpis.privateIncome || 0)}</p>
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
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Análisis de KPIs (IA)</h3></AccordionTrigger>
                            <AccordionContent className="px-4 grid md:grid-cols-2 gap-4">
                                {reportData.kpiAnalysis && Object.entries(reportData.kpiAnalysis).map(([key, value]: [string, any]) => (
                                    <div key={key} className="p-3 bg-muted/50 rounded-lg border">
                                        <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap"><span className="font-bold text-foreground">Valor: {value.value}</span> - {value.analysis}</p>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-market-analysis" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Análisis de Mercado (IAM)</h3></AccordionTrigger>
                            <AccordionContent className="px-4 grid md:grid-cols-3 gap-4">
                               <div className="p-3 bg-muted/50 rounded-lg border text-center">
                                 <p className="text-sm font-semibold text-muted-foreground">IAM (Índice Atractividad)</p>
                                 <p className="text-2xl font-bold">{reportData.marketAnalysis.iam.toFixed(2)}</p>
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
                                 <p className="text-2xl font-bold">{reportData.marketAnalysis.capacity} / {reportData.kpis.numStudents}</p>
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
                                    <Button onClick={() => saveReport(false)}>
                                    <Check className="mr-2 h-4 w-4" /> Finalizar Edición
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar Texto
                                    </Button>
                                )}
                                <Button onClick={() => saveReport(false)} variant="secondary">
                                    <Save className="mr-2 h-4 w-4" /> Guardar Borrador
                                </Button>
                                <Button onClick={() => saveReport(true)}>
                                    <Send className="mr-2 h-4 w-4" /> Publicar Reporte
                                </Button>
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
