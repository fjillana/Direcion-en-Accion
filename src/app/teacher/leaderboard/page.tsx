
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
import type { TeamPerformanceData, Game, StudentGameState } from "@/hooks/use-games";
import { useGames } from "@/hooks/use-games";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getAchievementsStatus, type Achievement } from "@/lib/achievements";


// Simplified team structure for the leaderboard view
type LeaderboardTeam = {
    rank: number;
    name: string;
    type: 'H' | 'IA';
    totalXp: number;
    kpis?: TeamPerformanceData['kpis'];
    decisions?: TeamPerformanceData['decisions'];
    strategicPlan?: Game['strategicPlan'];
    achievements: Achievement[];
};

const kpiConfig = {
  nma: { label: "Nota Media Alumnado", format: (v: number) => v.toFixed(1) },
  marketShare: { label: "Cuota de mercado", format: (v: number) => `${v.toFixed(1)}%` },
  studentTeacherRatio: { label: "Ratio Alumnos/Profesor", format: (v: number) => v.toFixed(1) },
  tuitionPrice: { label: "Precio Matrícula", format: (v: number) => `${new Intl.NumberFormat('es-ES').format(v)} CC` },
  numStudents: { label: "Nº Alumnos", format: (v: number) => new Intl.NumberFormat('es-ES').format(v) },
  personnelCost: { label: "Coste Personal / Ingresos", format: (v: number, income?: number) => income !== undefined && income > 0 ? `${((v / income) * 100).toFixed(1)}%` : `${v.toFixed(1)}%` },
  cash: { label: "Tesorería", format: (v: number) => `${new Intl.NumberFormat('es-ES').format(v)} CC` },
  morale: { label: "Moral", format: (v: number) => `${v.toFixed(0)}%` },
};


function getProgress(value: number, goal: { target: number; operator: string; }): number {
  if (goal.operator === 'min') {
    return Math.min((value / goal.target) * 100, 100);
  }
  if (goal.operator === 'max') {
    if (value > goal.target) {
        return Math.max(100 - ((value - goal.target) / goal.target) * 100, 0)
    }
    return 100;
  }
  return 0;
}


export default function TeacherLeaderboardPage() {
  const { activeGame, setActiveGameId } = useGame();
  const { getStudentGamesByGameId } = useGames();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedTeam, setSelectedTeam] = useState<LeaderboardTeam | null>(null);
  const [studentGamesData, setStudentGamesData] = useState<StudentGameState[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>("0");


  useEffect(() => {
    const gameId = searchParams.get('gameId');
    if (gameId && !activeGame) {
      setActiveGameId(gameId);
    }
  }, [searchParams, activeGame, setActiveGameId]);

  useEffect(() => {
    if (activeGame) {
      // Set the selected round to the latest completed round when the game changes.
      const lastCompletedRound = activeGame.round > 0 ? activeGame.round - 1 : 0;
      setSelectedRound(lastCompletedRound.toString());

      getStudentGamesByGameId(activeGame.id).then(data => {
        setStudentGamesData(data);
      });
    }
  }, [activeGame, getStudentGamesByGameId]);

  const teams: LeaderboardTeam[] = useMemo(() => {
    if (!activeGame || !activeGame.performance) return [];
    
    const performanceDataForSelectedRound = activeGame.performance[parseInt(selectedRound)];
    if (!performanceDataForSelectedRound) return [];

    const allPerformanceHistory = Object.values(activeGame.performance).flat();
    const teamNames = [...new Set(allPerformanceHistory.map(p => p.name))];

    return teamNames.map(name => {
        const teamHistory = allPerformanceHistory.filter(hist => hist.name === name);
        const cumulativeXp = teamHistory.reduce((acc, round) => acc + round.totalXp, 0);
        
        const performanceForRound = performanceDataForSelectedRound.find(p => p.name === name);
        
        let strategicPlan;
        if (performanceForRound?.type === 'H') {
            const studentState = studentGamesData.find(s => s.teamName === name);
            if (studentState) {
                strategicPlan = studentState.strategicPlan;
            }
        }
        
        const achievements = getAchievementsStatus(teamHistory);
        
        return {
            name,
            type: performanceForRound?.type || 'IA',
            totalXp: cumulativeXp,
            kpis: performanceForRound?.kpis,
            decisions: performanceForRound?.decisions,
            strategicPlan: strategicPlan,
            achievements: achievements,
        };
    })
    .sort((a, b) => b.totalXp - a.totalXp)
    .map((team, index) => ({
        ...team,
        rank: index + 1
    }));
  }, [activeGame, studentGamesData, selectedRound]);


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

  const getKpiColor = (value: number, goal?: { target: number; operator: string; }) => {
    if (!goal) return "";
    const progress = getProgress(value, goal);
    if (progress === 100) return "text-emerald-600";
    if (goal.operator === 'min' && value < goal.target) return "text-red-600";
    if (goal.operator === 'max' && value > goal.target) return "text-red-600";
    return "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Leaderboard: {activeGame.name}</CardTitle>
            <CardDescription>
              Clasificación global por XP acumulado. Los KPIs corresponden a la ronda seleccionada.
            </CardDescription>
          </div>
           <div className="w-[180px]">
              <Select
                  value={selectedRound}
                  onValueChange={setSelectedRound}
              >
                  <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Ronda" />
                  </SelectTrigger>
                  <SelectContent>
                      {Array.from({ length: activeGame.numRounds + 1 }, (_, i) => i).map((r) => (
                      <SelectItem key={r} value={r.toString()} disabled={!activeGame.performance?.[r]}>
                          Ronda {r}
                      </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
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
                <TableRow key={team.name} onClick={() => setSelectedTeam(team)} className="cursor-pointer">
                  <TableCell className="font-bold text-lg text-center">{team.rank}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <span>{team.name}</span>
                        <TooltipProvider>
                            <div className="flex items-center gap-1">
                                {team.achievements.map(badge => (
                                    badge.unlocked && (
                                        <Tooltip key={badge.name}>
                                            <TooltipTrigger>
                                                <Badge variant="secondary" className="px-1.5 py-0.5"><badge.icon className="h-4 w-4 text-primary" /></Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-semibold">{badge.name}</p>
                                                <p className="text-sm text-muted-foreground">{badge.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">{team.totalXp.toFixed(2)}</TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                  <TableCell className="text-right font-mono">{team.kpis ? kpiConfig.cash.format(team.kpis.cash) : 'N/A'}</TableCell>
                  <TableCell className={cn("text-right font-mono", team.kpis ? getKpiColor(team.kpis.nma, team.strategicPlan?.targets?.nma) : '')}>{team.kpis ? kpiConfig.nma.format(team.kpis.nma) : 'N/A'}</TableCell>
                  <TableCell className={cn("text-right font-mono", team.kpis ? getKpiColor(team.kpis.morale, team.strategicPlan?.targets?.morale) : '')}>{team.kpis ? kpiConfig.morale.format(team.kpis.morale) : 'N/A'}</TableCell>
                  <TableCell className={cn("text-right font-mono", team.kpis ? getKpiColor(team.kpis.marketShare, team.strategicPlan?.targets?.marketShare) : '')}>{team.kpis ? kpiConfig.marketShare.format(team.kpis.marketShare) : 'N/A'}</TableCell>
                  <TableCell className={cn("text-right font-mono", team.kpis ? getKpiColor(team.kpis.studentTeacherRatio, team.strategicPlan?.targets?.studentTeacherRatio) : '')}>{team.kpis ? kpiConfig.studentTeacherRatio.format(team.kpis.studentTeacherRatio) : 'N/A'}</TableCell>
                  <TableCell className="text-right font-mono">{team.decisions ? kpiConfig.tuitionPrice.format(team.decisions.tuitionPrice) : 'N/A'}</TableCell>
                  <TableCell className="text-right font-mono">{team.kpis ? kpiConfig.numStudents.format(team.kpis.numStudents) : 'N/A'}</TableCell>
                </TableRow>
              ))}
               {teams.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                          No hay datos disponibles para la ronda {selectedRound}.
                      </TableCell>
                  </TableRow>
              )}
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
                  Comparativa de KPIs actuales (Ronda {selectedRound}) contra los objetivos de la Ronda 0.
                </DialogDescription>
              </DialogHeader>
              {selectedTeam.strategicPlan?.rankingGoal && (
                  <blockquote className="mt-4 border-l-2 pl-6 italic">
                      "{selectedTeam.strategicPlan.rankingGoal}"
                  </blockquote>
              )}
              <div className="overflow-hidden rounded-lg border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>KPI</TableHead>
                      <TableHead>Plan Estratégico</TableHead>
                      <TableHead>Actual (Ronda {selectedRound})</TableHead>
                      <TableHead className="w-[200px]">Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {selectedTeam.type === 'H' && selectedTeam.strategicPlan?.targets && selectedTeam.kpis ? Object.entries(selectedTeam.strategicPlan.targets).map(([key, goal]) => {
                       if (!goal) return null;
                       const kpiKey = key as keyof typeof kpiConfig;
                       const kpiInfo = kpiConfig[kpiKey];
                       if (!kpiInfo) return null;
                       
                       let currentValue: number;
                       let formattedValue: string;
                       let formattedGoal: string;

                       if (kpiKey === 'personnelCost') {
                           currentValue = selectedTeam.kpis.income > 0 ? (selectedTeam.kpis.personnelCost / selectedTeam.kpis.income) * 100 : 0;
                           formattedValue = kpiInfo.format(currentValue);
                           formattedGoal = kpiInfo.format(goal.target);
                       } else {
                           currentValue = selectedTeam.kpis[kpiKey as keyof typeof selectedTeam.kpis] as number;
                           // @ts-ignore
                           formattedValue = kpiInfo.format(currentValue);
                           // @ts-ignore
                           formattedGoal = kpiInfo.format(goal.target);
                       }
                       const progress = getProgress(currentValue, goal);

                       return (
                         <TableRow key={`${selectedTeam.name}-${key}`}>
                           <TableCell>{kpiInfo.label}</TableCell>
                           <TableCell className="font-mono">{`${goal.operator === 'min' ? '>' : '<'} ${formattedGoal}`}</TableCell>
                           <TableCell className="font-mono">{formattedValue}</TableCell>
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
                                {selectedTeam.type === 'IA' ? 'Los equipos de IA no tienen un plan estratégico definido.' : 'No se han definido objetivos estratégicos o no hay datos de KPI para este equipo en la ronda seleccionada.'}
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

    