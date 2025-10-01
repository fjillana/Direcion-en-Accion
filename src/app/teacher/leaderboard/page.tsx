
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

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

type StrategicGoal = {
  target: number;
  operator: "min" | "max" | "range";
  range_max?: number;
};

type Team = {
  rank: number;
  name: string;
  xp: number;
  kpis: TeamKPIs;
  strategicGoals: { [key in keyof Omit<TeamKPIs, 'currentStudents' | 'tuitionPrice'>]?: StrategicGoal };
};

const teamsData: Team[] = [
  {
    rank: 1,
    name: "Equipo Delta",
    xp: 1800,
    kpis: { cash: 55000, personnelCost: 68, nma: 8.8, marketShare: 15, morale: 85, studentTeacherRatio: 23.5, currentStudents: 825, tuitionPrice: 115 },
    strategicGoals: { 
      cash: { target: 40000, operator: "min" }, 
      personnelCost: { target: 70, operator: "max" },
      nma: { target: 8.5, operator: "min" },
      marketShare: { target: 14, operator: "min" },
      morale: { target: 80, operator: "min" },
      studentTeacherRatio: { target: 24, operator: "max" }
    },
  },
  {
    rank: 2,
    name: "Equipo Beta",
    xp: 1500,
    kpis: { cash: 32000, personnelCost: 72, nma: 8.5, marketShare: 13.5, morale: 78, studentTeacherRatio: 24.0, currentStudents: 810, tuitionPrice: 118 },
    strategicGoals: { 
      cash: { target: 25000, operator: "min" },
      personnelCost: { target: 75, operator: "max" },
      nma: { target: 8.2, operator: "min" },
      marketShare: { target: 12, operator: "min" },
      morale: { target: 75, operator: "min" },
      studentTeacherRatio: { target: 24.5, operator: "max" }
    },
  },
  {
    rank: 3,
    name: "Equipo Alfa",
    xp: 1200,
    kpis: { cash: 21000, personnelCost: 76, nma: 8.2, marketShare: 12, morale: 71, studentTeacherRatio: 25.1, currentStudents: 802, tuitionPrice: 125 },
    strategicGoals: { 
      cash: { target: 16000, operator: "range", range_max: 32000 }, 
      personnelCost: { target: 78, operator: "max" },
      nma: { target: 8.0, operator: "min" },
      marketShare: { target: 11, operator: "min" },
      morale: { target: 70, operator: "min" },
      studentTeacherRatio: { target: 25, operator: "max" }
    },
  },
  {
    rank: 4,
    name: "Equipo Gamma",
    xp: 950,
    kpis: { cash: 15000, personnelCost: 79, nma: 7.9, marketShare: 11, morale: 65, studentTeacherRatio: 25.8, currentStudents: 795, tuitionPrice: 130 },
    strategicGoals: { 
      cash: { target: 10000, operator: "min" },
      personnelCost: { target: 80, operator: "max" },
      nma: { target: 8.0, operator: "min" },
      marketShare: { target: 10, operator: "min" },
      morale: { target: 68, operator: "min" },
      studentTeacherRatio: { target: 26, operator: "max" }
    },
  },
].sort((a, b) => b.xp - a.xp);

const kpiConfig = {
  cash: { label: "Saldo de tesorería", unit: "CC", format: (v: number) => new Intl.NumberFormat('es-ES').format(v) },
  personnelCost: { label: "Coste personal / Ingresos", unit: "%", format: (v: number) => `${v}%` },
  nma: { label: "Nota Media Alumnado", unit: "", format: (v: number) => v.toFixed(1) },
  marketShare: { label: "Cuota de mercado", unit: "%", format: (v: number) => `${v}%` },
  morale: { label: "Moral del personal", unit: "%", format: (v: number) => `${v}%` },
  studentTeacherRatio: { label: "Ratio Alumnos/Profesor", unit: "", format: (v: number) => v.toFixed(1) },
};


function getProgress(value: number, goal: StrategicGoal): number {
  if (goal.operator === 'min') {
    return Math.min((value / goal.target) * 100, 100);
  }
  if (goal.operator === 'max') {
    if (value > goal.target) {
        return Math.max(100 - ((value - goal.target) / goal.target) * 100, 0)
    }
    return 100;
  }
  if (goal.operator === 'range' && goal.range_max) {
      if(value < goal.target) return 0;
      if(value > goal.range_max) return 0;
      return 100;
  }
  return 0;
}


export default function TeacherLeaderboardPage() {
  const [teams] = useState<Team[]>(teamsData);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard General</CardTitle>
          <CardDescription>
            Clasificación global y cumplimiento de objetivos estratégicos. Haz clic para ver el detalle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead className="w-[80px]">Ranking en el mercado</TableHead>
                <TableHead className="text-right">Alumnos</TableHead>
                <TableHead className="text-right">Matrícula</TableHead>
                <TableHead className="text-right">XP Total</TableHead>
                <TableHead className="text-right">Nota Media</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team.name} onClick={() => setSelectedTeam(team)} className="cursor-pointer">
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                  <TableCell className="text-right font-mono">{team.kpis.currentStudents}</TableCell>
                  <TableCell className="text-right font-mono">{team.kpis.tuitionPrice} CC</TableCell>
                  <TableCell className="text-right font-mono">
                    {new Intl.NumberFormat('es-ES').format(team.xp)}
                  </TableCell>
                  <TableCell className="text-right">{team.kpis.nma.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Análisis Estratégico: {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                  Comparativa de KPIs actuales contra los objetivos de la Ronda 0.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Objetivo</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead className="w-[200px]">Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {Object.entries(selectedTeam.strategicGoals).map(([key, goal]) => {
                       if (!goal) return null;
                       const kpiKey = key as keyof Omit<TeamKPIs, 'currentStudents' | 'tuitionPrice'>;
                       const kpiInfo = kpiConfig[kpiKey];
                       const currentValue = selectedTeam.kpis[kpiKey];
                       const progress = getProgress(currentValue, goal);

                       return (
                         <TableRow key={`${selectedTeam.name}-${key}`}>
                           <TableCell>{kpiInfo.label}</TableCell>
                           <TableCell className="font-mono">{goal.operator === 'range' ? `${kpiInfo.format(goal.target)} - ${kpiInfo.format(goal.range_max!)}` : `${goal.operator === 'min' ? '>' : '<'} ${kpiInfo.format(goal.target)}`}</TableCell>
                           <TableCell className="font-mono">{kpiInfo.format(currentValue)}</TableCell>
                           <TableCell>
                             <div className="flex items-center gap-2">
                               <Progress value={progress} className="w-[120px]" />
                               <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
                             </div>
                           </TableCell>
                         </TableRow>
                       )
                     })}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

    