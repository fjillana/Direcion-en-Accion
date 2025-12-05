
"use client";

import { useState, useEffect } from "react";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ServerCrash } from "lucide-react";
import { Badge } from "../ui/badge";
import { investments as allInvestments } from '@/app/teacher/catalog/investment-data';
import { CrisisReport } from "./crisis-report";
import { cn } from "@/lib/utils";

export function StudentReport() {
  const { studentGame } = useStudentGame();
  const { getGameById } = useGames();
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportRound, setReportRound] = useState<number>(-1);

  useEffect(() => {
    if (studentGame && studentGame.gameId && studentGame.teamName) {
      const game = getGameById(studentGame.gameId);
      if (!game) {
        setIsLoading(false);
        return;
      }
      
      // Correct logic to determine which report to show
      let roundToShow: number;
      if (game.status === 'Finalizado') {
        // If game is finished, show the report for the last playable round
        roundToShow = game.numRounds; 
      } else {
        // If game is ongoing, show the report for the previously completed round
        roundToShow = game.round > 0 ? game.round - 1 : -1;
      }
      setReportRound(roundToShow);
      
      if (roundToShow >= 0 && game.reports?.[roundToShow]?.[studentGame.teamName]) {
        const report = game.reports[roundToShow][studentGame.teamName];
        if (report.published) {
          setReportData(report);
        } else {
          setReportData(null);
        }
      } else {
        setReportData(null);
      }
    }
    setIsLoading(false);
  }, [studentGame, getGameById]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value).replace('€', 'CC');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Reporte no Disponible</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <ServerCrash className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            El reporte para la ronda {reportRound >= 0 ? reportRound : 'anterior'} aún no ha sido publicado.
            <br />
            Por favor, espera a que el profesor lo envíe.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const gameData = getGameById(studentGame!.gameId!);
  const prevRoundIndex = reportData.round > 0 ? reportData.round - 1 : 0;
  
  let initialCashForRound = 0;
  if(reportData.round === 0) {
      initialCashForRound = gameData?.initialFunds || 0;
  } else {
      const prevRoundPerformance = gameData?.performance?.[prevRoundIndex]?.find(p => p.name === studentGame!.teamName);
      initialCashForRound = prevRoundPerformance?.kpis?.cash || 0;
  }
  
  const totalDecisionsCost = (reportData.decisions?.actions || []).reduce((sum: number, actionId: string) => {
    if (actionId === 'F4') return sum;
    if (actionId === 'P3' && reportData.decisions.poachingSuccess === false) return sum;
    
    const investmentInfo = allInvestments.find(inv => inv.id === actionId);
    if (investmentInfo) {
        if(investmentInfo.cost.type === 'fixed') {
            return sum + (investmentInfo.cost.value as number);
        }
        if(investmentInfo.cost.type === 'range') {
            return sum + (reportData.decisions.investmentCosts?.[actionId] || (investmentInfo.cost.value[1]));
        }
    }

    if (actionId === 'P2') return sum + 7500;
    if (actionId === 'P7') return sum + 7500;
    if (actionId === 'F5') return sum + 50000;
    return sum;
  }, 0);
  
  const totalIncome = reportData.kpis.income || 0;
  const crisisImpact = reportData.kpis.crisisImpact || 0;
  
  const totalCosts = (reportData.kpis.personnelCost || 0) + totalDecisionsCost + (reportData.kpis.loanInterest || 0) + Math.abs(crisisImpact < 0 ? crisisImpact : 0);
  
  const finalCash = reportData.kpis.cash || 0;

  const publicIncomeText = `(Base: 224.000 CC${reportData.kpis.publicIncome < 224000 ? ` - Crisis: ${(224000 - reportData.kpis.publicIncome).toLocaleString('es-ES')} CC` : ''})`;
  
  const getPrivateIncomeText = () => {
    let text = `(${reportData.kpis.numStudents} alumnos x ${formatCurrency(reportData.decisions.tuitionPrice)})`;
    const crisisResponse = reportData.decisions.crisisResponse;

    if (crisisResponse?.crisisId === 'C3') { // Solo aplicar para crisis de morosidad
        if (crisisResponse.optionId === 'C3_op2') {
            text += ' (+10.000 CC por solución de crisis)';
        } else if (reportData.kpis.privateIncome < reportData.kpis.numStudents * reportData.decisions.tuitionPrice) {
            text += ' - Crisis Morosidad';
        }
    }
    return text;
  };

  const privateIncomeText = getPrivateIncomeText();
  const personnelCostText = `(${reportData.kpis.numTeachers} profesores x 7.500 CC)${reportData.kpis.personnelCost > reportData.kpis.numTeachers * 7500 ? ' + Incremento Salarial' : ''}`;


  return (
     <Card>
        <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <CardTitle>Análisis de la Ronda {reportData.round}</CardTitle>
                <CardDescription>
                Este es el análisis de rendimiento de tu equipo para la ronda que acaba de finalizar.
                </CardDescription>
            </div>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['item-1', 'item-kpi-summary', 'item-financial-details', 'item-kpi-analysis', 'item-market-analysis', 'item-6', 'item-7']} className="w-full space-y-4 pt-4">
                
                <AccordionItem value="item-1" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Resumen Financiero</h3></AccordionTrigger>
                    <AccordionContent className="px-4 space-y-2">
                       <div className="p-3 bg-muted/50 rounded-lg border text-sm space-y-1">
                            <div className="flex justify-between"><span>Tesorería Inicial:</span> <span className="font-mono">{formatCurrency(initialCashForRound)}</span></div>
                            <div className="flex justify-between text-emerald-600"><span>(+) Ingresos Totales:</span> <span className="font-mono">{formatCurrency(totalIncome)}</span></div>
                            <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Ingreso Público:</span> <span className="font-mono">{formatCurrency(reportData.kpis.publicIncome || 0)}</span></div>
                            <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Ingreso Privado:</span> <span className="font-mono">{formatCurrency(reportData.kpis.privateIncome || 0)}</span></div>
                            {reportData.kpis.loanIncome > 0 && <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Ingreso Préstamo:</span> <span className="font-mono">{formatCurrency(reportData.kpis.loanIncome)}</span></div>}
                            {reportData.kpis.cashInjection > 0 && <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Inyección Liquidez (F4):</span> <span className="font-mono">{formatCurrency(reportData.kpis.cashInjection)}</span></div>}
                            {reportData.kpis.crisisImpact > 0 && <div className="pl-4 flex justify-between text-emerald-600/80"><span>&bull; Solución Crisis:</span> <span className="font-mono">{formatCurrency(reportData.kpis.crisisImpact)}</span></div>}

                            <div className="flex justify-between text-destructive"><span>(-) Gastos Totales:</span> <span className="font-mono">{formatCurrency(totalCosts)}</span></div>
                            <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Coste de Personal:</span> <span className="font-mono">{formatCurrency(reportData.kpis.personnelCost)}</span></div>
                            <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Coste Decisiones:</span> <span className="font-mono">{formatCurrency(totalDecisionsCost)}</span></div>
                            {crisisImpact < 0 && <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Impacto Crisis:</span> <span className="font-mono">{formatCurrency(crisisImpact)}</span></div>}
                            {reportData.kpis.loanInterest > 0 && <div className="pl-4 flex justify-between text-destructive/80"><span>&bull; Coste Intereses Préstamo:</span> <span className="font-mono">{formatCurrency(reportData.kpis.loanInterest)}</span></div>}
                            <div className="flex justify-between font-bold pt-2 border-t mt-1"><span>(=) Tesorería Final:</span> <span className="font-mono">{formatCurrency(finalCash)}</span></div>
                       </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-financial-details" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Detalle de Decisiones</h3></AccordionTrigger>
                    <AccordionContent className="px-4 space-y-4">
                        <div className="p-3 bg-muted/50 rounded-lg border">
                            <h4 className="font-semibold">Cálculos Clave de Ingresos y Gastos</h4>
                            <p className="text-sm text-muted-foreground mt-1">Ingreso Público (Subvención): {formatCurrency(reportData.kpis.publicIncome || 0)} <span className="text-xs">{publicIncomeText}</span></p>
                            <p className="text-sm text-muted-foreground">Ingreso Privado (Matrículas): {formatCurrency(reportData.kpis.privateIncome || 0)} <span className="text-xs">{privateIncomeText}</span></p>
                            <p className="text-sm text-muted-foreground">Coste de Personal (Salarios): {formatCurrency(reportData.kpis.personnelCost)} <span className="text-xs">{personnelCostText}</span></p>
                             {reportData.decisions.crisisResponse && (
                                <div className="mt-2 pt-2 border-t">
                                     <p className="text-sm text-muted-foreground">Impacto Crisis ({reportData.decisions.crisisResponse.crisisName}): {formatCurrency(reportData.kpis.crisisImpact || 0)}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg border">
                            <h4 className="font-semibold">Inversiones y Acciones Realizadas</h4>
                            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
                                {(reportData.decisions.actions || []).length > 0 ? (reportData.decisions.actions || []).map((actionId: string, index: number) => {
                                  const investment = allInvestments.find(inv => inv.id === actionId);
                                  if (investment) {
                                      if (investment.id === 'P3') {
                                        const success = reportData.decisions.poachingSuccess;
                                        return (
                                            <li key={`inv-${index}`}>
                                                {investment.name}: {success ? formatCurrency(investment.cost.value as number) : '0 CC'}.
                                                <span className={cn("font-semibold ml-1", success ? 'text-emerald-600' : 'text-amber-600')}>
                                                    {success ? "Ejecutado con éxito" : "No ha tenido éxito (moral del rival > 70%)"}
                                                </span>
                                            </li>
                                        );
                                      }
                                      const cost = reportData.decisions.investmentCosts?.[actionId] || (investment.cost.type === 'fixed' ? investment.cost.value : (investment.cost.value as number[])[1]);
                                      const costString = typeof cost === 'number' ? formatCurrency(cost) : cost;
                                      return <li key={`inv-${index}`}>{investment.name}: {costString}</li>;
                                  }
                                  
                                  const centerActionsMap: Record<string, {name: string, cost: string | number}> = {
                                      'F5': { name: 'Ampliación de Aulas', cost: 50000 },
                                      'P7': { name: 'Despedir Docente', cost: 7500 },
                                      'P2': { name: 'Contratar Docente', cost: 'Coste salarial recurrente' },
                                  };
                                  const centerAction = centerActionsMap[actionId];
                                  if (centerAction) {
                                      const costString = typeof centerAction.cost === 'number' ? formatCurrency(centerAction.cost) : centerAction.cost;
                                      return <li key={`act-${index}`}>{centerAction.name}: {costString}</li>;
                                  }
                                  return null;
                                }) : (
                                  <li>No se realizaron inversiones ni acciones esta ronda.</li>
                                )}
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
                    <AccordionContent className="px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                         <p className="text-sm font-semibold text-muted-foreground">Ocupación (Final / Capacidad)</p>
                         <p className="text-2xl font-bold">{reportData.kpis.numStudents} / {reportData.marketAnalysis.capacity}</p>
                       </div>
                    </AccordionContent>
                </AccordionItem>
                
                 {reportData.decisions.crisisResponse && (
                    <AccordionItem value="item-crisis" className="border rounded-lg">
                        <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Análisis de Crisis</h3></AccordionTrigger>
                        <AccordionContent className="px-4">
                            <CrisisReport report={reportData.decisions.crisisResponse} />
                        </AccordionContent>
                    </AccordionItem>
                )}

                <AccordionItem value="item-6" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                        <h3 className="font-semibold text-lg">Análisis Cualitativo y Sugerencias</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 space-y-4">
                        <div className="space-y-2">
                             <div className="p-4 bg-muted/50 rounded-lg border">
                                <p className="leading-relaxed text-sm whitespace-pre-wrap">{reportData.qualitativeAnalysis}</p>
                             </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="item-7" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                        <h3 className="font-semibold text-lg">Preguntas para la Reflexión</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 space-y-4">
                        <div className="space-y-2">
                             <div className="p-4 bg-muted/50 rounded-lg border">
                                <ul className="list-disc pl-5 space-y-2">
                                  {(reportData.debriefingQuestions || []).map((q: string, i: number) => (
                                    <li key={i} className="text-sm leading-relaxed">{q}</li>
                                  ))}
                                </ul>
                             </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
  );
}

    