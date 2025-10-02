
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
      const round = studentGame.round ? studentGame.round -1 : 0; // Report is for the completed round
      
      if (game && game.reports && game.reports[round] && game.reports[round][studentGame.teamName]) {
        const report = game.reports[round][studentGame.teamName];
        if(report.published){
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
            El reporte para la ronda {studentGame?.round ? studentGame.round -1 : 'anterior'} aún no ha sido publicado.
            <br />
            Por favor, espera a que el profesor lo envíe.
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
                Este es el análisis de rendimiento de tu equipo para la ronda que acaba de finalizar.
                </CardDescription>
            </div>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['item-1', 'item-kpi-summary', 'item-kpi-analysis', 'item-market-analysis', 'item-6', 'item-financial-details', 'item-7']} className="w-full space-y-4 pt-4">
                
                <AccordionItem value="item-1" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Resumen Financiero</h3></AccordionTrigger>
                    <AccordionContent className="px-4 grid md:grid-cols-2 gap-4">
                        <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Ingresos Totales:</span> <span>{formatCurrency(reportData.kpis.income)}</span></Badge>
                        <Badge variant="outline" className="flex justify-between p-3 text-sm"><span>Costes Totales:</span> <span className="text-destructive">{formatCurrency(reportData.kpis.personnelCost + (reportData.decisions?.investments || []).reduce((acc: number, inv: any) => acc + inv.cost, 0))}</span></Badge>
                        <Badge variant="outline" className="md:col-span-2 flex justify-between p-3 text-sm font-bold"><span>Tesorería Final:</span> <span>{formatCurrency(reportData.kpis.cash)}</span></Badge>
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
                    <AccordionTrigger className="px-4 hover:no-underline"><h3 className="font-semibold text-lg">Análisis de KPIs</h3></AccordionTrigger>
                    <AccordionContent className="px-4 grid md:grid-cols-2 gap-4">
                        {reportData.kpiAnalysis && Object.entries(reportData.kpiAnalysis).map(([key, value]: [string, any]) => (
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
