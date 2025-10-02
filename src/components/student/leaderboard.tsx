
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGames } from "@/hooks/use-games";
import { useStudentGame } from "@/hooks/useStudentGame";

type Team = {
  rank: number;
  name: string;
  type: 'H' | 'IA';
  xp: number;
  kpis: {
    nma: number;
    marketShare: number;
    studentTeacherRatio: number;
    tuitionPrice: number;
    numStudents: number;
  };
};

const kpiConfig = {
  nma: { label: "Nota Media Alumnado", format: (v: number) => v.toFixed(1) },
  marketShare: { label: "Cuota de mercado", format: (v: number) => `${v.toFixed(1)}%` },
  studentTeacherRatio: { label: "Ratio Alumnos/Profesor", format: (v: number) => v.toFixed(1) },
  tuitionPrice: { label: "Precio Matrícula", format: (v: number) => `${new Intl.NumberFormat('es-ES').format(v)} CC` },
  numStudents: { label: "Nº Alumnos", format: (v: number) => new Intl.NumberFormat('es-ES').format(v) },
};

export function Leaderboard() {
  const { studentGame } = useStudentGame();
  const { getGameById } = useGames();

  const teams = useMemo(() => {
    if (!studentGame?.gameId) return [];
    
    const game = getGameById(studentGame.gameId);
    if (!game || !game.performance) return [];

    const lastRoundToShow = game.round === 1 ? 0 : game.round - 1;
    if (lastRoundToShow < 0 || !game.performance[lastRoundToShow]) return [];
    
    const performanceData = game.performance[lastRoundToShow];

    return performanceData
      .map(p => ({
        name: p.name,
        type: p.type,
        xp: p.totalXp,
        kpis: {
          nma: p.reputation.peb,
          marketShare: p.kpis.marketShare,
          studentTeacherRatio: p.morale.peb,
          tuitionPrice: p.decisions.tuitionPrice,
          numStudents: p.kpis.numStudents,
        },
      }))
      .sort((a, b) => b.xp - a.xp)
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [studentGame, getGameById]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Clasificación global y KPIs públicos de todos los equipos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ranking</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="w-[50px] text-center">Tipo</TableHead>
                <TableHead className="text-right">NMA</TableHead>
                <TableHead className="text-right">Cuota Mercado</TableHead>
                <TableHead className="text-right">Ratio Alumno/Prof</TableHead>
                <TableHead className="text-right">Precio Matrícula</TableHead>
                <TableHead className="text-right">Nº Alumnos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.name} className={cn(team.name === studentGame?.teamName && 'bg-accent/50 hover:bg-accent/60')}>
                  <TableCell className="font-bold text-lg text-center">{team.rank}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.nma.format(team.kpis.nma)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.marketShare.format(team.kpis.marketShare)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.studentTeacherRatio.format(team.kpis.studentTeacherRatio)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.tuitionPrice.format(team.kpis.tuitionPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.numStudents.format(team.kpis.numStudents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
