
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
import { useState } from "react";
import { cn } from "@/lib/utils";

type TeamKPIs = {
  cash: number;
  personnelCost: number;
  nma: number;
  marketShare: number;
  morale: number;
  studentTeacherRatio: number;
  currentStudents: number;
  tuitionPrice: number;
};

type Team = {
  rank: number;
  name: string;
  type: 'H' | 'IA';
  xp: number;
  kpis: TeamKPIs;
};

const teamsData: Team[] = [
  {
    rank: 1,
    name: "Equipo Delta",
    type: 'H',
    xp: 1800,
    kpis: { cash: 55000, personnelCost: 68, nma: 8.8, marketShare: 15, morale: 85, studentTeacherRatio: 23.5, currentStudents: 825, tuitionPrice: 115 },
  },
  {
    rank: 2,
    name: "Equipo Beta",
    type: 'H',
    xp: 1500,
    kpis: { cash: 32000, personnelCost: 72, nma: 8.5, marketShare: 13.5, morale: 78, studentTeacherRatio: 24.0, currentStudents: 810, tuitionPrice: 118 },
  },
    {
    rank: 3,
    name: "IA Rival 1",
    type: 'IA',
    xp: 1450,
    kpis: { cash: 45000, personnelCost: 70, nma: 8.4, marketShare: 12.5, morale: 80, studentTeacherRatio: 25.0, currentStudents: 805, tuitionPrice: 120 },
  },
  {
    rank: 4,
    name: "Equipo Alfa",
    type: 'H',
    xp: 1200,
    kpis: { cash: 21000, personnelCost: 76, nma: 8.2, marketShare: 12, morale: 71, studentTeacherRatio: 25.1, currentStudents: 802, tuitionPrice: 125 },
  },
  {
    rank: 5,
    name: "Equipo Gamma",
    type: 'H',
    xp: 950,
    kpis: { cash: 15000, personnelCost: 79, nma: 7.9, marketShare: 11, morale: 65, studentTeacherRatio: 25.8, currentStudents: 795, tuitionPrice: 130 },
  },
].sort((a, b) => b.xp - a.xp).map((team, index) => ({...team, rank: index + 1}));

const kpiConfig = {
  nma: { label: "Nota Media Alumnado", format: (v: number) => v.toFixed(1) },
  marketShare: { label: "Cuota de mercado", format: (v: number) => `${v}%` },
  studentTeacherRatio: { label: "Ratio Alumnos/Profesor", format: (v: number) => v.toFixed(1) },
  tuitionPrice: { label: "Precio Matrícula", format: (v: number) => `${new Intl.NumberFormat('es-ES').format(v)} CC` },
  currentStudents: { label: "Nº Alumnos", format: (v: number) => new Intl.NumberFormat('es-ES').format(v) },
};


export function Leaderboard() {
  const [teams] = useState<Team[]>(teamsData);

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
                <TableRow key={team.name} className={cn(team.name === 'Equipo Beta' && 'bg-accent/50 hover:bg-accent/60')}>
                  <TableCell className="font-bold text-lg text-center">{team.rank}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.nma.format(team.kpis.nma)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.marketShare.format(team.kpis.marketShare)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.studentTeacherRatio.format(team.kpis.studentTeacherRatio)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.tuitionPrice.format(team.kpis.tuitionPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.currentStudents.format(team.kpis.currentStudents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
