
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
            El reporte para la ronda {studentGame?.round ? studentGame.round -1 : 'anterior'} aún no está disponible.
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
                Este es el análisis de rendimiento de tu equipo para la ronda que acaba de finalizar.
                </CardDescription>
            </div>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={['item-6']} className="w-full space-y-4 pt-4">
                {/* AI Qualitative Analysis */}
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

                 {/* Debriefing Questions */}
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
