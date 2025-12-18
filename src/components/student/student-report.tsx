"use client";

import { useState, useEffect, useMemo } from "react";
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
  const { studentGame: studentState, isLoading: isStudentLoading } = useStudentGame();
  const { games, loading: isGamesLoading } = useGames();
  
  const [reportData, setReportData] = useState<any>(null);
  const [displayRound, setDisplayRound] = useState<number>(0);

  const game = useMemo(() => {
      if (!studentState?.gameId) return null;
      return games.find(g => g.id === studentState.gameId);
  }, [studentState?.gameId, games]);

  useEffect(() => {
    // Si no hay juego o equipo, limpiamos y salimos
    if (!game || !studentState?.teamName) {
      setReportData(null);
      return;
    }
    
    let foundReport = null;
    let reportRound = -1;

    // ESTRATEGIA ROBUSTA:
    // En lugar de calcular matemáticamente dónde debería estar el reporte,
    // miramos qué reportes existen realmente en el objeto 'game.reports'.
    const availableReportIndices = game.reports 
        ? Object.keys(game.reports).map(Number).sort((a, b) => b - a) // Ordenamos de mayor a menor
        : [];

    // Iteramos desde el índice más alto encontrado hacia abajo
    for (const i of availableReportIndices) {
        const report = game.reports?.[i]?.[studentState.teamName];
        // Si el reporte existe y está publicado, ese es el que mostramos
        if (report && report.published) {
            foundReport = report;
            reportRound = i;
            break; 
        }
    }

    if (foundReport) {
        setReportData(foundReport);
        setDisplayRound(reportRound);
    } else {
        setReportData(null);
        // Lógica de fallback solo para mostrar el mensaje de "Esperando ronda X"
        const relevantRound = game.status === 'Finalizado' 
            ? (game.numRounds ? game.numRounds - 1 : 0) 
            : Math.max(0, game.round - 1);
        setDisplayRound(relevantRound);
    }
    
  }, [game, studentState?.teamName]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value).replace('€', 'CC');

  const isLoading = isStudentLoading || isGamesLoading;

  // SUSTITUYE EL RETURN FINAL POR ESTO TEMPORALMENTE:
  return (
     <Card className="border-red-500 border-2">
        <CardHeader>
            <CardTitle className="text-red-500">MODO DIAGNÓSTICO</CardTitle>
            <CardDescription>Pásame una captura o copia el texto de abajo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 bg-slate-950 text-green-400 font-mono text-xs rounded overflow-auto max-h-[500px]">
                <p><strong>Estado Juego:</strong> {game?.status} (Ronda actual: {game?.round})</p>
                <p><strong>Mi Equipo:</strong> {studentState?.teamName}</p>
                <p><strong>Indices de Reportes Encontrados:</strong> {JSON.stringify(game?.reports ? Object.keys(game.reports) : 'Ninguno')}</p>
                <hr className="my-2 border-green-800"/>
                <p><strong>Buscando reportes en:</strong></p>
                {game?.reports && Object.keys(game.reports).map(key => {
                    const r = game.reports[key][studentState?.teamName || ''];
                    return (
                        <div key={key} className="mb-2 pl-2 border-l-2 border-green-700">
                            Index [{key}]: {r ? (r.published ? "✅ PUBLICADO" : "❌ BORRADOR (No visible)") : "⚠️ NO EXISTE para este equipo"}
                        </div>
                    )
                })}
            </div>
        </CardContent>
    </Card>
  );
}