
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
import { useGames, type TeamPerformanceData } from "@/hooks/use-games";
import { useStudentGame } from "@/hooks/useStudentGame";

type Team = {
  rank: number;
  name: string;
  type: 'H' | 'IA';
  xp: number;
  kpis: {
    cash: number;
    nma: number;
    morale: number;
    marketShare: number;
    studentTeacherRatio: number;
    tuitionPrice: number;
    numStudents: number;
  };
};

const kpiConfig = {
  cash: { label: "Tesorería", format: (v: number) => `${new Intl.NumberFormat('es-ES').format(v)} CC` },
  nma: { label: "Nota Media Alumnado", format: (v: number) => v.toFixed(1) },
  morale: { label: "Moral", format: (v: number) => `${v.toFixed(0)}%` },
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

    const currentRound = game.round;
    // Show KPIs from the last completed round. If round 0, there are no KPIs to show from a previous round.
    const roundForKpis = currentRound > 0 ? currentRound - 1 : -1;
    
    const roundDataForKpis = roundForKpis !== -1 ? game.performance[roundForKpis] : [];

    const allPerformanceHistory = Object.values(game.performance).flat();
    const teamNames = [...new Set(allPerformanceHistory.map(p => p.name))];

    return teamNames
      .map(name => {
        const teamHistory = allPerformanceHistory.filter(p => p.name === name);
        const cumulativeXp = teamHistory.reduce((acc, round) => acc + round.totalXp, 0);
        
        const kpiData = roundDataForKpis.find(p => p.name === name);
        const type = kpiData?.type || (game.teamNames.includes(name) ? 'H' : 'IA');
        
        return {
          name,
          type,
          xp: cumulativeXp,
          kpis: {
            cash: kpiData?.kpis.cash || 0,
            nma: kpiData?.kpis.nma || 0,
            morale: kpiData?.kpis.morale || 0,
            marketShare: kpiData?.kpis.marketShare || 0,
            studentTeacherRatio: kpiData?.kpis.studentTeacherRatio || 0,
            tuitionPrice: kpiData?.decisions.tuitionPrice || 0,
            numStudents: kpiData?.kpis.numStudents || 0,
          },
        };
      })
      .sort((a, b) => b.xp - a.xp)
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [studentGame, getGameById]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Clasificación global por XP acumulado. Los KPIs corresponden a la última ronda finalizada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ranking</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">XP Acumulado</TableHead>
                <TableHead className="w-[50px] text-center">Tipo</TableHead>
                <TableHead className="text-right">Tesorería</TableHead>
                <TableHead className="text-right">NMA</TableHead>
                <TableHead className="text-right">Moral</TableHead>
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
                  <TableCell className="text-right font-mono font-bold text-primary">{team.xp.toFixed(2)}</TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.cash.format(team.kpis.cash)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.nma.format(team.kpis.nma)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.morale.format(team.kpis.morale)}</TableCell>
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

    
