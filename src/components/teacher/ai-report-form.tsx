

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { investments as allInvestments } from '@/app/teacher/catalog/investment-data';
import { CrisisReport } from "../student/crisis-report";

type TeamName = string;


export function AIReportForm() {
  const { activeGame } = useGame();
  const { updateReport, getGameById } = useGames();
  const { toast } = useToast();
  
  const reportableRound = useMemo(() => {
    if (!activeGame) return 0;
    if (activeGame.status === "Finalizado") {
      return activeGame.numRounds;
    }
    return activeGame.round > 0 ? activeGame.round - 1 : 0;
  }, [activeGame]);

  const teamsData = useMemo(() => {
    if (!activeGame || !activeGame.performance) return [];
    const perf = activeGame.performance[reportableRound];
    if (!perf) return [];
    return perf;
  }, [activeGame, reportableRound]);


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

  const [marketAnalysis, setMarketAnalysis] = useState<ReturnType<typeof calculateMarketAttractiveness>>({});

  useEffect(() => {
    if (activeGame && teamsData.length > 0) {
        const fullMarketAnalysis = calculateMarketAttractiveness(teamsData.map(t => ({...t, kpis: t.kpis, decisions: t.decisions})), activeGame);
        setMarketAnalysis(fullMarketAnalysis);
    }
  }, [activeGame, teamsData]);

  useEffect(() => {
    if (activeGame && selectedTeam) {
        const existingReport = activeGame.reports?.[reportableRound]?.[selectedTeam];
        
        if (existingReport) {
            setReportData(existingReport);
            setQualitativeAnalysis(existingReport.qualitativeAnalysis || "");
            setDebriefingQuestions(existingReport.debriefingQuestions || []);
            setPedagogicalSuggestions(existingReport.pedagogicalSuggestions || "");
            setHasReport(true);
        } else {
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
  }, [selectedTeam, activeGame, reportableRound]);

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
    
    // Find previous round's KPIs for comparison
    const previousRoundNumber = reportableRound - 1;
    const previousPerformance = activeGame.performance?.[previousRoundNumber]?.find(p => p.name === selectedTeam);
    const previousKpis = previousPerformance ? previousPerformance.kpis : null;


    setIsGenerating(true);
    try {
      const reportPayload = {
        gameId: activeGame.id,
        roundNumber: reportableRound,
        teamPerformanceData: JSON.stringify({
          ...teamPerformance,
          decisions: {
            ...teamPerformance.decisions,
            actions: teamPerformance.decisions?.actions || [],
          }
        }, null, 2),
        marketConditions: `Mercado con ${activeGame.newStudentsPerRound} nuevos alumnos disponibles.`,
        previousKpis: previousKpis ? JSON.stringify(previousKpis, null, 2) : undefined
      };
      
      console.log(`[GPS] 6. Generating AI Report for ${selectedTeam}. Payload:`, reportPayload);

      const result = await generateRoundReport(reportPayload);
      
      const teamMarketResult = marketAnalysis[selectedTeam];

      const newReportData = {
          round: reportableRound,
          kpis: teamPerformance.kpis,
          decisions: teamPerformance.decisions,
          kpiAnalysis: result.kpiAnalysis,
          marketAnalysis: {
            iam: teamMarketResult.iam,
            iamBreakdown: teamMarketResult.points,
            newStudentsCaptured: teamMarketResult.newStudents,
            newStudentsInMarket: activeGame.newStudentsPerRound,
            capacity: teamPerformance.kpis.capacity || 810,
            finalStudents: Math.min(teamPerformance.kpis.numStudents + teamMarketResult.newStudents, teamPerformance.kpis.capacity || 810),
          },
          qualitativeAnalysis: result.reporteCualitativo,
          debriefingQuestions: result.preguntasMayeuticas,
          pedagogicalSuggestions: result.sugerenciasPedagogicas,
          published: false, // Default to not published
      };

      setReportData(newReportData);
      setQualitativeAnalysis(result.reporteCualitativo);
      setDebriefingQuestions(result.preguntasMayeuticas);
      setPedagogicalSuggestions(result.sugerenciasPedagogicas);
      setHasReport(true);
      
      // Also save this generated report as a draft immediately
      updateReport(activeGame.id, reportableRound, selectedTeam, newReportData);

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
      published: publish,
    };
    
    updateReport(activeGame.id, reportableRound, selectedTeam, fullReportData);

    toast({
      title: publish ? "Reporte Publicado" : "Borrador Guardado",
      description: `El informe para ${selectedTeam} ha sido ${publish ? 'publicado' : 'guardado como borrador'}.`,
    });

    if (isEditing) {
        setIsEditing(false);
    }
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value).replace('€', 'CC');
  
  const formatKpiValue = (valueStr: string, key: string): string => {
    if (typeof valueStr !== 'string') return valueStr;

    if (valueStr.includes('%') || key === 'cuotaDeMercado' || key === 'moral') {
        const numericValue = parseFloat(valueStr.replace(/[^0-9,-]/g, '').replace(',', '.'));
        if (isNaN(numericValue)) return valueStr;
        return `${numericValue.toFixed(2).replace('.', ',')}%`;
    }

    if (key === 'nma' || key === 'ratioAlumnosProfesor') {
        const numericValue = parseFloat(valueStr.replace(/[^0-9,-]/g, '').replace(',', '.'));
        if (isNaN(numericValue)) return valueStr;
        const decimalPlaces = key === 'nma' ? 1 : 2;
        return numericValue.toFixed(decimalPlaces).replace('.', ',');
    }

    const numericValue = parseInt(valueStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericValue)) return valueStr;
    
    return new Intl.NumberFormat('es-ES').format(numericValue);
  };

  const { 
    finalCash, 
    totalIncome,
    totalCosts,
    initialCashForRound,
    crisisImpact,
    cashInjection,
  } = useMemo(() => {
    if (!reportData || !activeGame || !selectedTeam) {
      return { finalCash: 0, totalIncome: 0, totalCosts: 0, initialCashForRound: 0, crisisImpact: 0, cashInjection: 0 };
    }
    
    const kpis = reportData.kpis || {};
    
    const gameData = getGameById(activeGame.id);
    let cashAtStart = gameData?.initialFunds || 0;

    if (reportData.round > 0) {
      const prevRoundIndex = reportData.round - 1;
      const prevRoundPerformance = gameData?.performance?.[prevRoundIndex]?.find(p => p.name === selectedTeam);
      if (prevRoundPerformance) {
        cashAtStart = prevRoundPerformance.kpis.cash;
      }
    }

    return { 
        finalCash: kpis.cash || 0,
        totalIncome: kpis.income || 0,
        totalCosts: (kpis.personnelCost || 0) + (kpis.loanInterest || 0),
        initialCashForRound: cashAtStart,
        crisisImpact: kpis.crisisImpact || 0,
        cashInjection: kpis.cashInjection || 0,
    };
  }, [reportData, activeGame, getGameById, selectedTeam]);

  const totalDecisionsCost = useMemo(() => {
     if (!reportData || !reportData.decisions) return 0;
     const { actions = [], investmentCosts = {} } = reportData.decisions;
     
     const centerActionsCostMap: Record<string, number> = { 'F5': 50000, 'P7': 7500, 'P2': 7500 };
     
     const totalCenterActionsCost = actions.reduce((acc: number, actionId: string) => {
      return acc + (centerActionsCostMap[actionId as keyof typeof centerActionsCostMap] || 0);
     }, 0);

     const totalInvestmentCost = actions.reduce((acc: number, actionId: string) => {
        const investment = allInvestments.find(inv => inv.id === actionId);
        if (investment) {
            if (investment.id === 'F4') return acc; // F4 is cash injection, not cost
            if (investment.cost.type === 'fixed') {
                return acc + (investment.cost.value as number);
            }
            return acc + (investmentCosts?.[actionId] || investment.cost.value[1]);
        }
        return acc;
    }, 0);

    return totalCenterActionsCost + totalInvestmentCost;

  }, [reportData]);
  
  const publicIncomeText = reportData?.kpis ? `(Base: 224.000 CC${reportData.kpis.publicIncome < 224000 ? ` - Crisis: ${(224000 - reportData.kpis.publicIncome).toLocaleString('es-ES')} CC` : ''})` : '';
  const privateIncomeText = reportData?.kpis ? `(${reportData.kpis.numStudents} alumnos x ${formatCurrency(reportData.decisions.tuitionPrice)})${reportData.kpis.privateIncome < reportData.kpis.numStudents * reportData.decisions.tuitionPrice ? ' - Crisis Morosidad' : ''}` : '';
  const personnelCostText = reportData?.kpis ? `(${reportData.kpis.numTeachers} profesores x 7.500 CC)${reportData.kpis.personnelCost > reportData.kpis.numTeachers * 7500 ? ' + Incremento Salarial' : ''}` : '';


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
              Genera y edita el informe de rendimiento y las preguntas de debriefing para cada equipo en la Ronda {reportableRound}.
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
                    <Accordion type="multiple" defaultValue={['item-1', 'item-kpi-summary', 'item-financial-details', 'item-kpi-analysis', 'item-market-analysis', 'item-6']} className="w-full space-y-4 pt-4">
                        
                        <AccordionItem value="item-1" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Resumen Financiero</h3></AccordionTrigger>
                            <AccordionContent className="px-4 space-y-2">
                               <div className="p-3 bg-muted/50 rounded-lg border text-sm space-y-1">
                                    <div className="flex justify-between"><span>Tesorería Inicial:</span> <span className="font-mono">{formatCurrency(initialCashForRound)}</span></div>
                                    <div className="flex justify-between text-emerald-600"><span>(+) Ingresos Totales:</span> <span className="font-mono">{formatCurrency(totalIncome)}</span></div>
                                    <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Ingreso Público:</span> <span className="font-mono">{formatCurrency(reportData.kpis.publicIncome || 0)}</span></div>
                                    <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Ingreso Privado:</span> <span className="font-mono">{formatCurrency(reportData.kpis.privateIncome || 0)}</span></div>
                                    {reportData.kpis.loanIncome > 0 && <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Ingreso Préstamo:</span> <span className="font-mono">{formatCurrency(reportData.kpis.loanIncome)}</span></div>}
                                    {cashInjection > 0 && <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Inyección Liquidez (F4):</span> <span className="font-mono">{formatCurrency(cashInjection)}</span></div>}
                                    {crisisImpact > 0 && <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Solución Crisis:</span> <span className="font-mono">{formatCurrency(crisisImpact)}</span></div>}
                                    
                                    <div className="flex justify-between text-destructive"><span>(-) Gastos Totales:</span> <span className="font-mono">{formatCurrency(totalCosts + totalDecisionsCost + Math.abs(crisisImpact < 0 ? crisisImpact : 0))}</span></div>
                                    <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Coste de Personal:</span> <span className="font-mono">{formatCurrency(reportData.kpis.personnelCost)}</span></div>
                                    <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Coste Decisiones:</span> <span className="font-mono">{formatCurrency(totalDecisionsCost)}</span></div>
                                    {crisisImpact < 0 && <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Impacto Crisis:</span> <span className="font-mono">{formatCurrency(crisisImpact)}</span></div>}
                                    {reportData.kpis.loanInterest > 0 && <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Coste Intereses Préstamo:</span> <span className="font-mono">{formatCurrency(reportData.kpis.loanInterest)}</span></div>}
                                    <div className="flex justify-between font-bold pt-2 border-t mt-1"><span>(=) Tesorería Final:</span> <span className="font-mono">{formatCurrency(finalCash)}</span></div>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                        
                         <AccordionItem value="item-financial-details" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Detalle Financiero y de Decisiones</h3></AccordionTrigger>
                            <AccordionContent className="px-4 space-y-4">
                                <div className="p-3 bg-muted/50 rounded-lg border">
                                    <h4 className="font-semibold">Cálculos Clave de Ingresos y Gastos</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Ingreso Público: {formatCurrency(reportData.kpis.publicIncome || 0)} <span className="text-xs">{publicIncomeText}</span></p>
                                    <p className="text-sm text-muted-foreground">Ingreso Privado: {formatCurrency(reportData.kpis.privateIncome || 0)} <span className="text-xs">{privateIncomeText}</span></p>
                                    <p className="text-sm text-muted-foreground">Coste Personal: {formatCurrency(reportData.kpis.personnelCost)} <span className="text-xs">{personnelCostText}</span></p>
                                    {reportData.decisions.crisisResponse && (
                                        <div className="mt-2 pt-2 border-t">
                                            <p className="text-sm text-muted-foreground">Impacto Crisis ({reportData.decisions.crisisResponse.crisisName}): {formatCurrency(reportData.kpis.crisisImpact || 0)}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg border">
                                    <h4 className="font-semibold">Decisiones Realizadas</h4>
                                    <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                        {(reportData.decisions.actions || []).map((actionId: string, index: number) => {
                                          const investment = allInvestments.find(inv => inv.id === actionId);
                                          if (investment) {
                                            const cost = reportData.decisions.investmentCosts?.[actionId] || (investment.cost.type === 'fixed' ? investment.cost.value : (investment.cost.value as number[])[1]);
                                            return <li key={`${actionId}-${index}`}>{investment.name}: {formatCurrency(cost as number)}</li>
                                          }
                                          if (actionId === 'P2') return <li key={`${actionId}-${index}`}>Contratar Docente (Coste salarial recurrente)</li>
                                          if (actionId === 'P7') return <li key={`${actionId}-${index}`}>Despedir Docente: {formatCurrency(7500)}</li>
                                          if (actionId === 'F5') return <li key={`${actionId}-${index}`}>Ampliación de Aulas: {formatCurrency(50000)}</li>
                                          return null;
                                        })}
                                        {(reportData.decisions.actions || []).length === 0 && <li>No se realizaron decisiones esta ronda.</li>}
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                         <AccordionItem value="item-kpi-summary" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Resumen de KPIs</h3></AccordionTrigger>
                            <AccordionContent className="px-4 grid md:grid-cols-3 gap-4">
                                <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Saldo de Tesorería:</span> <span className="font-bold">{formatCurrency(finalCash)}</span></Badge>
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
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                            <span className="font-bold text-foreground">Valor: {formatKpiValue(value.value, key)}</span>
                                            {' - '}
                                            {value.analysis}
                                        </p>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-market-analysis" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Análisis de Mercado (IAM)</h3></AccordionTrigger>
                            <AccordionContent className="px-4 space-y-4">
                               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-3 bg-muted/50 rounded-lg border text-center">
                                        <p className="text-sm font-semibold text-muted-foreground">IAM (Índice Atractividad)</p>
                                        <p className="text-2xl font-bold">{reportData.marketAnalysis.iam.toFixed(2)}</p>
                                        {reportData.marketAnalysis.iamBreakdown && (
                                          <p className="text-xs text-muted-foreground font-mono">
                                            (NMA: {reportData.marketAnalysis.iamBreakdown.nma.toFixed(1)} + Precio: {reportData.marketAnalysis.iamBreakdown.price.toFixed(1)} + Mkt: {reportData.marketAnalysis.iamBreakdown.marketing.toFixed(1)})
                                          </p>
                                        )}
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
                                        <p className="text-sm font-semibold text-muted-foreground">Ocupación (Final / Capacidad)</p>
                                        <p className="text-2xl font-bold">{reportData.kpis.numStudents} / {reportData.marketAnalysis.capacity}</p>
                                    </div>
                               </div>
                               <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Equipo</TableHead>
                                            <TableHead className="text-center">Tipo</TableHead>
                                            <TableHead className="text-right">IAM</TableHead>
                                            <TableHead className="text-right">Alumnos Captados</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.values(marketAnalysis).map((teamMarketData: any) => (
                                            <TableRow key={teamMarketData.name}>
                                                <TableCell className="font-medium">{teamMarketData.name}</TableCell>
                                                <TableCell className="text-center font-mono text-xs">{teamMarketData.type}</TableCell>
                                                <TableCell className="text-right font-mono">{teamMarketData.iam.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-mono">{teamMarketData.newStudents}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
