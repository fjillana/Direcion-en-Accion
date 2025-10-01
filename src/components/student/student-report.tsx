
"use client";

import { useState, useEffect } from "react";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, ServerCrash } from "lucide-react";
import { Badge } from "../ui/badge";

export function StudentReport() {
  const { studentGame } = useStudentGame();
  const { getGameById } = useGames();
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentGame && studentGame.gameId && studentGame.teamName) {
      const game = getGameById(studentGame.gameId);
      const round = studentGame.round || 1;
      
      if (game && game.reports && game.reports[round] && game.reports[round][studentGame.teamName]) {
        setReportData(game.reports[round][studentGame.teamName]);
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
            El reporte para esta ronda aún no está disponible.
            <br />
            Por favor, espera a que el profesor lo publique.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
     <Card>
        <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <CardTitle>Análisis de la Ronda {reportData.round}</CardTitle>
                <CardDescription>
                Este es el análisis de rendimiento de tu equipo para la ronda actual.
                </CardDescription>
            </div>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['item-1', 'item-6']} className="w-full space-y-4 pt-4">
                
                {/* Resumen Financiero */}
                <AccordionItem value="item-1" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                    <h3 className="font-semibold text-lg">Resumen Financiero</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Ingresos:</span> <span className="font-mono">{formatCurrency(reportData.financialSummary.income)}</span></div>
                    <div className="flex justify-between"><span>Coste Personal:</span> <span className="font-mono text-red-500">- {formatCurrency(reportData.financialSummary.personnelCost)}</span></div>
                    <div className="flex justify-between"><span>Inversiones:</span> <span className="font-mono text-red-500">- {formatCurrency(reportData.financialSummary.investmentsCost)}</span></div>
                    <div className="flex justify-between font-bold border-t pt-2"><span>Resultado Ronda:</span> <span className="font-mono">{formatCurrency(reportData.financialSummary.roundResult)}</span></div>
                    <div className="flex justify-between font-bold"><span>Tesorería Final:</span> <span className="font-mono">{formatCurrency(reportData.financialSummary.cashFlow)}</span></div>
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
                                {reportData.financialDetail.numStudents} alumnos x {formatCurrency(reportData.financialDetail.tuitionPrice)}/trimestre = <span className="font-bold text-foreground">{formatCurrency(reportData.financialSummary.income)}</span>
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Coste de Personal</h4>
                            <p className="text-sm text-muted-foreground">
                                {reportData.financialDetail.numTeachers} profesores x {formatCurrency(reportData.financialDetail.teacherCost)}/trimestre = <span className="font-bold text-foreground">{formatCurrency(reportData.financialSummary.personnelCost)}</span>
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Inversiones Realizadas</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                {reportData.financialDetail.investments.map((inv: any) => (
                                    <li key={inv.name}>
                                        <span className="font-semibold">{inv.name}</span> ({formatCurrency(inv.cost)}): <span className="text-muted-foreground">Impacto -> {inv.effect}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* KPIs Summary */}
                <AccordionItem value="item-3" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                        <h3 className="font-semibold text-lg">Resumen de KPIs Finales</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                        <div className="rounded-lg border p-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Saldo Tesorería:</span><span className="font-mono">{reportData.kpiSummary.cash}</span></div>
                            <div className="flex justify-between"><span>Coste Personal/Ingreso:</span><span className="font-mono">{reportData.kpiSummary.personnelCost}</span></div>
                            <div className="flex justify-between"><span>Nota Media Alumnado:</span><span className="font-mono">{reportData.kpiSummary.nma}</span></div>
                            <div className="flex justify-between"><span>Cuota de Mercado:</span><span className="font-mono">{reportData.kpiSummary.marketShare}</span></div>
                            <div className="flex justify-between"><span>Moral Personal:</span><span className="font-mono">{reportData.kpiSummary.morale}</span></div>
                            <div className="flex justify-between"><span>Ratio Alumnos/Profesor:</span><span className="font-mono">{reportData.kpiSummary.studentTeacherRatio}</span></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                
                {/* KPIs Analysis */}
                <AccordionItem value="item-4" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                        <h3 className="font-semibold text-lg">Análisis de KPIs</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 space-y-4">
                        {Object.entries(reportData.kpiAnalysis).map(([key, value]: [string, any]) => (
                            <div key={key}>
                                <h4 className="font-medium flex items-center gap-2 flex-wrap">
                                    {key === 'personnelCost' && 'Coste Personal / Ingresos'}
                                    {key === 'nma' && 'Nota Media Alumnado'}
                                    {key === 'marketShare' && 'Cuota de Mercado'}
                                    {key === 'morale' && 'Moral del Personal'}
                                    {key === 'studentTeacherRatio' && 'Ratio Alumnos/Profesor'}
                                    <Badge variant="secondary">{value.value}</Badge>
                                    {value.calculation && <Badge variant="outline" className="font-mono">{value.calculation}</Badge>}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">{value.analysis}</p>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                
                {/* Captación y Capacidad */}
                <AccordionItem value="item-5" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                        <h3 className="font-semibold text-lg">Captación y Capacidad (IAM)</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">IAM</p>
                                <p className="text-2xl font-bold">{reportData.marketAttractiveness.iam}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Alumnos Captados</p>
                                <p className="text-2xl font-bold text-emerald-600">{reportData.marketAttractiveness.newStudents}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Alumnos Perdidos</p>
                                <p className="text-2xl font-bold text-red-600">{reportData.marketAttractiveness.lostStudents}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium">Análisis de Mercado</h4>
                            <p className="text-sm text-muted-foreground mt-1">{reportData.marketAttractiveness.analysis}</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* AI Qualitative Analysis */}
                <AccordionItem value="item-6" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                        <h3 className="font-semibold text-lg">Análisis Cualitativo y Sugerencias</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 space-y-4">
                        <div className="space-y-2">
                             <div className="p-4 bg-muted/50 rounded-lg border">
                                <p className="leading-relaxed text-sm">{reportData.qualitativeAnalysis}</p>
                             </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
  );
}
