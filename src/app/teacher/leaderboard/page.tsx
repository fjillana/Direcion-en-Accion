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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  currentStudents: { label: "Alumnos Actuales", unit: "", format: (v: number) => v.toString() },
  tuitionPrice: { label: "Precio Matrícula", unit: "CC", format: (v: number) => `${v} CC` },
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

function GoalComplianceIcon({ value, goal }: { value: number; goal: StrategicGoal }) {
    const progress = getProgress(value, goal);
    if (progress === 100) return <ArrowUp className="text-green-500" />;
    if (progress < 50) return <ArrowDown className="text-red-500" />;
    return <Minus className="text-yellow-500" />;
}


export default function TeacherLeaderboardPage() {
  const [teams] = useState<Team[]>(teamsData);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [filteredTeam, setFilteredTeam] = useState("all");

  const teamsForStrategicView =
    filteredTeam === "all"
      ? teams
      : teams.filter((team) => team.name === filteredTeam);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Leaderboard General</h1>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Clasificación General</TabsTrigger>
          <TabsTrigger value="strategic">Cumplimiento Estratégico</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Clasificación de todos los juegos</CardTitle>
              <CardDescription>
                Rendimiento global de los equipos. Haz clic para ver KPIs.
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
        </TabsContent>
        <TabsContent value="strategic">
           <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Análisis de Cumplimiento Estratégico</CardTitle>
                        <CardDescription>
                            Comparativa de los KPIs actuales contra los objetivos de la Ronda 0.
                        </CardDescription>
                    </div>
                    <div className="w-[200px]">
                        <Select value={filteredTeam} onValueChange={setFilteredTeam}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por equipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los equipos</SelectItem>
                                {teams.map(team => (
                                    <SelectItem key={team.name} value={team.name}>{team.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipo</TableHead>
                    <TableHead>KPI</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead className="w-[150px]">Progreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamsForStrategicView.flatMap(team =>
                     Object.entries(team.strategicGoals).map(([key, goal]) => {
                       if (!goal) return null;
                       const kpiKey = key as keyof Omit<TeamKPIs, 'currentStudents' | 'tuitionPrice'>;
                       const kpiInfo = kpiConfig[kpiKey];
                       const currentValue = team.kpis[kpiKey];
                       const progress = getProgress(currentValue, goal);

                       return (
                         <TableRow key={`${team.name}-${key}`}>
                           <TableCell className="font-medium">{team.name}</TableCell>
                           <TableCell>{kpiInfo.label}</TableCell>
                           <TableCell className="font-mono">{goal.operator === 'range' ? `${kpiInfo.format(goal.target)} - ${kpiInfo.format(goal.range_max!)}` : `${goal.operator === 'min' ? '>' : '<'} ${kpiInfo.format(goal.target)}`}</TableCell>
                           <TableCell className="font-mono">{kpiInfo.format(currentValue)}</TableCell>
                           <TableCell>
                             <div className="flex items-center gap-2">
                               <Progress value={progress} className="w-[100px]" />
                               <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
                             </div>
                           </TableCell>
                         </TableRow>
                       )
                     })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de KPIs: {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                  Indicadores clave de rendimiento para la ronda actual.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableBody>
                    {Object.entries(selectedTeam.kpis).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                           {kpiConfig[key as keyof TeamKPIs].label}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                           {kpiConfig[key as keyof TeamKPIs].format(value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
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

    