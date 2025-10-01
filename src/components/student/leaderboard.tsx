
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

type StrategicGoal = {
  target: number;
  operator: "min" | "max" | "range";
  range_max?: number;
};

type Team = {
  rank: number;
  name: string;
  type: 'H' | 'IA';
  xp: number;
  kpis: TeamKPIs;
  strategicGoals: { [key in keyof Omit<TeamKPIs, 'currentStudents' | 'tuitionPrice'>]?: StrategicGoal };
};

const teamsData: Team[] = [
  {
    rank: 1,
    name: "Equipo Delta",
    type: 'H',
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
    type: 'H',
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
    name: "IA Rival 1",
    type: 'IA',
    xp: 1450,
    kpis: { cash: 45000, personnelCost: 70, nma: 8.4, marketShare: 12.5, morale: 80, studentTeacherRatio: 25.0, currentStudents: 805, tuitionPrice: 120 },
    strategicGoals: { 
      cash: { target: 30000, operator: "min" },
    },
  },
  {
    rank: 4,
    name: "Equipo Alfa",
    type: 'H',
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
    rank: 5,
    name: "Equipo Gamma",
    type: 'H',
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
].sort((a, b) => b.xp - a.xp).map((team, index) => ({...team, rank: index + 1}));

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


export function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>(teamsData);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const getKpiColor = (value: number, goal?: StrategicGoal) => {
    if (!goal) return "";
    const progress = getProgress(value, goal);
    if (progress === 100) return "text-emerald-600";
    if (goal.operator === 'min' && value < goal.target) return "text-red-600";
    if (goal.operator === 'max' && value > goal.target) return "text-red-600";
    if (goal.operator === 'range' && (value < goal.target || value > goal.range_max!)) return "text-red-600";
    return "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            Clasificación global y KPIs principales. Haz clic en un equipo para ver el detalle de objetivos estratégicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead className="w-[50px] text-center">Tipo</TableHead>
                <TableHead className="w-[80px]">Ranking</TableHead>
                <TableHead className="text-right">Tesorería</TableHead>
                <TableHead className="text-right">Coste Personal</TableHead>
                <TableHead className="text-right">NMA</TableHead>
                <TableHead className="text-right">Cuota Mercado</TableHead>
                <TableHead className="text-right">Moral</TableHead>
                <TableHead className="text-right">Ratio Alumno/Prof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.name} onClick={() => setSelectedTeam(team)} className="cursor-pointer">
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                  <TableCell className="font-bold text-lg">{team.rank}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.cash, team.strategicGoals.cash))}>{kpiConfig.cash.format(team.kpis.cash)}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.personnelCost, team.strategicGoals.personnelCost))}>{kpiConfig.personnelCost.format(team.kpis.personnelCost)}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.nma, team.strategicGoals.nma))}>{kpiConfig.nma.format(team.kpis.nma)}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.marketShare, team.strategicGoals.marketShare))}>{kpiConfig.marketShare.format(team.kpis.marketShare)}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.morale, team.strategicGoals.morale))}>{kpiConfig.morale.format(team.kpis.morale)}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.studentTeacherRatio, team.strategicGoals.studentTeacherRatio))}>{kpiConfig.studentTeacherRatio.format(team.kpis.studentTeacherRatio)}</TableCell>
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
                  Comparativa de KPIs actuales contra el plan estratégico de la Ronda 0.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Plan Estratégico</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead className="w-[200px]">Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {selectedTeam.type === 'H' ? Object.entries(selectedTeam.strategicGoals).map(([key, goal]) => {
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
                     }) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                Los equipos de IA no tienen un plan estratégico definido.
                            </TableCell>
                        </TableRow>
                     )}
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
