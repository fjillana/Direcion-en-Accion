

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
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGame } from "@/hooks/use-game-context";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TeamPerformanceData } from "@/hooks/use-games";


type StrategicGoal = {
  target: number;
  operator: "min" | "max" | "range";
  range_max?: number;
};

// Simplified team structure for the leaderboard view
type LeaderboardTeam = {
    rank: number;
    name: string;
    type: 'H' | 'IA';
    totalXp: number;
    kpis: {
        nma: number;
        marketShare: number;
        studentTeacherRatio: number;
        tuitionPrice: number;
        numStudents: number;
    };
    // Strategic goals are optional and mostly for human teams.
    strategicGoals?: { [key: string]: StrategicGoal };
};

const kpiConfig = {
  nma: { label: "Nota Media Alumnado", format: (v: number) => v.toFixed(1) },
  marketShare: { label: "Cuota de mercado", format: (v: number) => `${v.toFixed(1)}%` },
  studentTeacherRatio: { label: "Ratio Alumnos/Profesor", format: (v: number) => v.toFixed(1) },
  tuitionPrice: { label: "Precio Matrícula", format: (v: number) => `${new Intl.NumberFormat('es-ES').format(v)} CC` },
  numStudents: { label: "Nº Alumnos", format: (v: number) => new Intl.NumberFormat('es-ES').format(v) },
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
  const { activeGame, setActiveGameId } = useGame();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedTeam, setSelectedTeam] = useState<LeaderboardTeam | null>(null);

  useEffect(() => {
    const gameId = searchParams.get('gameId');
    if (gameId && !activeGame) {
      setActiveGameId(gameId);
    }
  }, [searchParams, activeGame, setActiveGameId]);

  const teams = useMemo(() => {
      if (!activeGame || !activeGame.performance) return [];
      
      // Use performance data from the last completed round
      const lastRound = activeGame.round > 1 ? activeGame.round - 1 : 1;
      const performanceData = activeGame.performance[lastRound];

      if (!performanceData) return [];

      return performanceData.map(p => ({
          name: p.name,
          type: p.type,
          totalXp: p.totalXp,
          kpis: {
            // This is a mock until decisions and kpis are fully connected
            nma: 8.5,
            marketShare: 12,
            studentTeacherRatio: 25,
            tuitionPrice: 120,
            numStudents: 810,
          },
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((team, index) => ({
          ...team,
          rank: index + 1
      }));
  }, [activeGame]);


  if (!activeGame) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-muted-foreground">Por favor, selecciona una partida desde el dashboard para ver el leaderboard.</p>
                <Button onClick={() => router.push('/teacher/dashboard')}>Ir al Dashboard</Button>
            </CardContent>
        </Card>
    );
  }

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
          <CardTitle>Leaderboard: {activeGame.name}</CardTitle>
          <CardDescription>
            Clasificación global y KPIs públicos. Haz clic en un equipo para ver el detalle de objetivos estratégicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead className="w-[50px] text-center">Tipo</TableHead>
                <TableHead className="w-[80px]">Ranking</TableHead>
                <TableHead className="text-right">NMA</TableHead>
                <TableHead className="text-right">Cuota Mercado</TableHead>
                <TableHead className="text-right">Ratio Alumno/Prof</TableHead>
                <TableHead className="text-right">Precio Matrícula</TableHead>
                <TableHead className="text-right">Nº Alumnos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.name} onClick={() => setSelectedTeam(team)} className="cursor-pointer">
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                  <TableCell className="font-bold text-lg">{team.rank}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.nma, team.strategicGoals?.nma))}>{kpiConfig.nma.format(team.kpis.nma)}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.marketShare, team.strategicGoals?.marketShare))}>{kpiConfig.marketShare.format(team.kpis.marketShare)}</TableCell>
                  <TableCell className={cn("text-right font-mono", getKpiColor(team.kpis.studentTeacherRatio, team.strategicGoals?.studentTeacherRatio))}>{kpiConfig.studentTeacherRatio.format(team.kpis.studentTeacherRatio)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.tuitionPrice.format(team.kpis.tuitionPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{kpiConfig.numStudents.format(team.kpis.numStudents)}</TableCell>
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
                      <TableHead>Plan Estratégico</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead className="w-[200px]">Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {selectedTeam.type === 'H' && selectedTeam.strategicGoals ? Object.entries(selectedTeam.strategicGoals).map(([key, goal]) => {
                       if (!goal) return null;
                       const kpiKey = key as keyof Omit<typeof kpiConfig, 'tuitionPrice' | 'numStudents'>;
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
                                {selectedTeam.type === 'IA' ? 'Los equipos de IA no tienen un plan estratégico definido.' : 'No se han definido objetivos estratégicos para este equipo.'}
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

    