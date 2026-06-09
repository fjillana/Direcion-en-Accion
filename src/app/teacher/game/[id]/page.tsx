

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2, LogOut, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { AIReportForm } from "@/components/teacher/ai-report-form";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useParams, useRouter } from 'next/navigation'
import { RoundConfig } from "@/components/teacher/round-config";
import type { Investment, Crisis } from "@/components/teacher/catalog-editor";
import { useGames } from "@/hooks/use-games";
import type { Game, TeamPerformanceData, TeamDecision } from "@/hooks/use-games";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simulateRound } from "@/lib/game-logic/round-simulation";
import { Separator } from "@/components/ui/separator";
import { investments as allInvestments } from "@/app/teacher/catalog/investment-data";
import { crises as fullCrisesList } from "@/app/teacher/catalog/crises-data";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import type { TeamKPIs } from "@/lib/game-logic/types";


export default function GameDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { games, setActiveGameId, updateGame, updateTeamPerformance, getStudentGamesByGameId, forceStudentDecisions, updateTeamKpis } = useGames();
  const router = useRouter();
  const { toast } = useToast();

  const [game, setGame] = useState<Game | null>(null);
  const [currentRoundTab, setCurrentRoundTab] = useState<string>("0");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamPerformanceData | null>(null);
  const [isDecisionDetailOpen, setDecisionDetailOpen] = useState(false);
  const [isPebDetailOpen, setPebDetailOpen] = useState(false);
  const [isKpiEditorOpen, setKpiEditorOpen] = useState(false);
  const [editingKpis, setEditingKpis] = useState<Partial<TeamKPIs> | null>(null);

  const [monitoringData, setMonitoringData] = useState<TeamPerformanceData[]>([]);

  useEffect(() => {
    const foundGame = games.find((g) => g.id === id);
    if (foundGame) {
      setGame(foundGame);
    }
  }, [games, id]);
  
  useEffect(() => {
    if (game) {
      const lastCompletedRound = game.round > 0 ? game.round : 0;
      setCurrentRoundTab(lastCompletedRound.toString());
    }
  }, [game?.id, game?.round]);

  useEffect(() => {
    if (game && game.performance) {
        const performanceForRound = game.performance?.[parseInt(currentRoundTab)];
        setMonitoringData(performanceForRound || []);
    }
  }, [currentRoundTab, game]);

  const handleForceDecision = async (teamName: string) => {
    if (!game) return;
    try {
      await forceStudentDecisions(game.id, teamName, game.round);
      toast({
        title: "Decisión Forzada",
        description: `Las decisiones para ${teamName} han sido enviadas.`,
      });
    } catch (error) {
      console.error("Error forcing decision:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo forzar la decisión para el equipo.",
      });
    }
  }


  const handleProcessRound = async () => {
    setIsProcessing(true);
    try {
      if (game) {
        const studentGames = await getStudentGamesByGameId(game.id);

        console.log(`[GPS] 2. Processing Round ${game.round} for Game "${game.name}"`);
        const { performanceData, newMessages, automaticCrises } = simulateRound(game, studentGames);

        await updateTeamPerformance(game.id, game.round, performanceData, newMessages, automaticCrises);
        
        toast({
          title: "Ronda Procesada",
          description: `La ronda ${game.round} ha sido procesada con éxito.`,
        });
      }
    } catch (error: any) {
      console.error("Error processing round:", error);
      toast({
        variant: "destructive",
        title: "Error al procesar ronda",
        description: error.message || "Ocurrió un error inesperado al simular la ronda.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleTeamRowClick = (team: TeamPerformanceData) => {
    setSelectedTeam(team);
    setPebDetailOpen(true);
  };

  const handleOpenKpiEditor = (team: TeamPerformanceData) => {
    setSelectedTeam(team);
    setEditingKpis(team.kpis);
    setKpiEditorOpen(true);
  }

  const handleSaveKpis = async () => {
    if (!game || !selectedTeam || !editingKpis) return;
    try {
      await updateTeamKpis(game.id, parseInt(currentRoundTab), selectedTeam.name, editingKpis);
      toast({
        title: "KPIs Actualizados",
        description: `Los datos para ${selectedTeam.name} han sido guardados.`,
      });
      setKpiEditorOpen(false);
    } catch (error) {
      console.error("Error updating KPIs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron actualizar los KPIs.",
      });
    }
  };


  const getPebColor = (peb: number) => {
    if (peb > 100) return "text-emerald-600";
    if (peb < 90) return "text-red-600";
    return "text-foreground";
  };
  
  const handleExitGame = () => {
    setActiveGameId(null);
    router.push('/teacher/dashboard');
  };

  const allTeamsConfirmed = useMemo(() => {
    if (!game || game.teamNames.length === 0) {
        return false;
    }

    // This check is now required for ALL rounds, including round 0.
    const roundDecisions = game.decisions?.[game.round];
    if (!roundDecisions) return false;

    return game.teamNames.every(teamName => {
        const teamDecision = roundDecisions[teamName];
        return teamDecision?.roundConfirmed === true;
    });
}, [game]);


  const getButtonText = () => {
      if (!game) return "Cargando...";
      if (game.status === 'Finalizado') return "Juego Finalizado";
      if (game.round === 0) return `Procesar Ronda 0 (Setup)`;
      if (game.round === game.numRounds) return `Procesar Ronda Final (${game.round})`;
      return `Procesar Ronda ${game.round}`;
  }
  
  const isButtonDisabled = () => {
      if (isProcessing) return true;
      if (!game || game.status === 'Finalizado') return true;
      if (!allTeamsConfirmed) return true;
      if (game.round > game.numRounds) return true;
      return false;
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES').format(value);

  const centerActionsMap: Record<string, { name: string; cost: number }> = {
    'P2': { name: 'Contratar Docente', cost: 7500 },
    'P7': { name: 'Despedir Docente', cost: 7500 }, // Indemnización
    'F5': { name: 'Ampliación de Aulas', cost: 50000 },
  };
  
  const fullDecisionsForDialog = useMemo(() => {
    if (!selectedTeam || !game) return null;
    return game.decisions?.[parseInt(currentRoundTab)]?.[selectedTeam.name] || selectedTeam.decisions;
  }, [selectedTeam, game, currentRoundTab]);
  
  const getBonusSourceNames = (team: TeamPerformanceData, area: 'finances' | 'reputation' | 'morale'): string => {
    if (!team?.decisions) return "";
  
    const sources: string[] = [];
  
    // Check investment-based bonuses
    (team.decisions.actions || []).forEach(actionId => {
        // Special handling for Poaching to avoid double counting
        if (actionId === 'P3') {
            if (team.decisions.poachingSuccess && area === 'morale') {
                sources.push('Poaching Exitoso');
            }
            return; // Skip further processing for P3
        }
  
        const investment = allInvestments.find(inv => inv.id === actionId);
        if (investment && investment.xpBonus[area]) {
            sources.push(investment.name);
        }
        if (investment && investment.effects.reputationPenalty && area === 'reputation') {
            sources.push(`${investment.name} (Penalización)`);
        }
  
        // Handle center actions with XP
        if (actionId === 'P2' && area === 'morale') sources.push('Contratar Docente');
        if (actionId === 'P7' && area === 'morale') sources.push('Despedir Docente');
        if (actionId === 'F5' && area === 'finances') sources.push('Ampliación de Aulas');
    });
  
    // Check crisis-based bonuses/penalties
    const crisisId = team.decisions.crisisResponse?.crisisId;
    const optionId = team.decisions.crisisResponse?.optionId;
    if (crisisId && optionId) {
        const crisisXpEffects: Record<string, Record<string, Partial<Record<'finances' | 'reputation' | 'morale', number>>>> = {
            'C1': { 'C1_op1': { morale: 5, finances: -5 }, 'C1_op2': { morale: 3, finances: -3 }, 'C1_op3': { finances: -15, reputation: -15, morale: -15 }, 'C1_op4': { morale: 2 }, 'C1_op5': { finances: 5, reputation: -10 } },
            'C2': { 'C2_op2': { reputation: -15 }, 'C2_op3': { reputation: 5, finances: -5 }, 'C2_op5': { finances: 8, reputation: -8 } },
            'C3': { 'C3_op1': { reputation: 2, finances: -2 }, 'C3_op2': { finances: 5, reputation: -5 }, 'C3_op3': { finances: -20 }, 'C3_op4': { finances: 3, reputation: -4 }, 'C3_op5': { reputation: 3, finances: 2 } },
            'C4': { 'C4_op1': { reputation: -5 }, 'C4_op2': { reputation: -2, morale: 2 }, 'C4_op3': { finances: 5 }, 'C4_op4': { reputation: 5 }, 'C4_op5': { reputation: 3 } },
            'C5': { 'C5_op1': { reputation: -3, finances: -5 }, 'C5_op2': { reputation: 5, morale: 3 }, 'C5_op3': { morale: 3 }, 'C5_op4': { reputation: -10 }, 'C5_op5': { finances: -2, reputation: 2 } },
            'C6': { 'C6_op1': { finances: -2, reputation: 2 }, 'C6_op2': { finances: 4, reputation: 2 }, 'C6_op4': { finances: 4, reputation: -5 }, 'C6_op5': { finances: -2 } },
            'C7': { 'C7_op1': { reputation: -8 }, 'C7_op2': { reputation: -4, morale: 3 }, 'C7_op3': { reputation: 5, morale: 3 }, 'C7_op4': { reputation: -2, morale: 2 }, 'C7_op5': { reputation: -10, finances: 5 } }
        };
        const effect = crisisXpEffects[crisisId]?.[optionId];
        if (effect && effect[area]) {
            sources.push(effect[area]! > 0 ? "Bonus Crisis" : "Penalización Crisis");
        }
    }
  
    if (sources.length === 0) return "";
    return `(${sources.join(', ')})`;
  };

  const parsePebBreakdown = (breakdown: string[]) => {
    return breakdown.map(line => {
      const parts = line.split(':');
      const label = parts[0];
      const value = parseFloat(parts[1].trim().split(' ')[0]);
      return { label, value };
    });
  };


  if (!game) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-bold font-headline">
              {game.name}
            </h1>
            <Button variant="outline" size="sm" onClick={handleExitGame}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir de la Partida
            </Button>
          </div>
          <Button size="lg" onClick={handleProcessRound} disabled={isButtonDisabled()}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-5 w-5" />
            )}
            {isProcessing ? "Procesando..." : getButtonText()}
          </Button>
        </div>
         <p className="text-muted-foreground -mt-4">
              Ronda {game.round} de {game.numRounds} - Juego ID: {id}
          </p>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring">Monitorización</TabsTrigger>
            <TabsTrigger value="decisions">Decisiones</TabsTrigger>
            <TabsTrigger value="reports">Reportes IA</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>
          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Progreso de Equipos</CardTitle>
                        <CardDescription>
                            Vista general del rendimiento por áreas. Haz clic en un equipo para ver el detalle.
                        </CardDescription>
                    </div>
                     <div className="w-[180px]">
                        <Select
                            value={currentRoundTab}
                            onValueChange={setCurrentRoundTab}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Ronda" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: game.numRounds + 1 }, (_, i) => i).map((r) => (
                                <SelectItem key={r} value={r.toString()} disabled={r > game.round}>
                                    Ronda {r}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                {monitoringData.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Equipo</TableHead>
                            <TableHead className="w-[50px] text-center">Tipo</TableHead>
                            <TableHead className="text-center">PEB Finanzas</TableHead>
                            <TableHead className="text-center">XP Finanzas</TableHead>
                            <TableHead className="text-center">PEB Reputación</TableHead>
                            <TableHead className="text-center">XP Reputación</TableHead>
                            <TableHead className="text-center">PEB Moral</TableHead>
                            <TableHead className="text-center">XP Moral</TableHead>
                            <TableHead className="text-right">Total XP</TableHead>
                            <TableHead className="w-[150px] text-center">Acciones</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {monitoringData.map((team) => (
                            <TableRow key={team.name} onClick={() => handleTeamRowClick(team)} className="cursor-pointer">
                            <TableCell className="font-medium">{team.name}</TableCell>
                            <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                            <TableCell className={cn("text-center font-mono", getPebColor(team.finances.peb))}>{team.finances.peb.toFixed(2)}</TableCell>
                            <TableCell className="text-center font-mono">{team.finances.xp.toFixed(2)}</TableCell>
                            <TableCell className={cn("text-center font-mono", getPebColor(team.reputation.peb))}>{team.reputation.peb.toFixed(2)}</TableCell>
                            <TableCell className="text-center font-mono">{team.reputation.xp.toFixed(2)}</TableCell>
                            <TableCell className={cn("text-center font-mono", getPebColor(team.morale.peb))}>{team.morale.peb.toFixed(2)}</TableCell>
                            <TableCell className="text-center font-mono">{team.morale.xp.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-bold font-mono">{team.totalXp.toFixed(2)}</TableCell>
                            <TableCell className="text-center space-x-2">
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTeam(team); setDecisionDetailOpen(true); }}>Ver</Button>
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenKpiEditor(team); }}>Editar KPIs</Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-10 text-sm text-muted-foreground">
                        No hay datos disponibles para la ronda {currentRoundTab}.
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Decisiones de la Ronda {game.round}</CardTitle>
                <CardDescription>
                  Monitoriza qué equipos han confirmado sus decisiones. Puedes forzar el envío si un equipo está inactivo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-right">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.teamNames.map(teamName => {
                        const decision = game.decisions?.[game.round]?.[teamName];
                        const isConfirmed = decision?.roundConfirmed;
                        const isForced = decision?.forcedByTeacher;
                        
                        return (
                          <TableRow key={teamName}>
                            <TableCell className="font-medium">{teamName}</TableCell>
                            <TableCell className="text-right">
                              {isConfirmed ? (
                                <Badge variant={isForced ? "destructive" : "default"}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {isForced ? 'Forzado por Profesor' : 'Decisión Tomada'}
                                </Badge>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleForceDecision(teamName)}>
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  Forzar Decisión
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <AIReportForm />
          </TabsContent>
          <TabsContent value="config">
             <RoundConfig
              allTeams={game.teamNames.concat(Array.from({ length: (game.teamNames.length > 0 ? game.teamNames.length : 0) }, (_, i) => `IA Rival ${i + 1}`))}
              fullInvestments={allInvestments}
              fullCrises={fullCrisesList}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isPebDetailOpen} onOpenChange={setPebDetailOpen}>
        <DialogContent className="sm:max-w-4xl">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Desglose de PEB: {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                    Cálculo detallado de los Puntos de Equilibrio de Negocio para cada área en la ronda {currentRoundTab}.
                </DialogDescription>
                 {fullDecisionsForDialog?.forcedByTeacher && (
                    <p className="text-sm font-bold text-destructive pt-2">
                        Decisiones forzadas por inacción. Se ha aplicado una penalización del 50% al XP.
                    </p>
                )}
              </DialogHeader>
              <div className="grid md:grid-cols-3 gap-4 py-4 text-sm">
                 <div className="space-y-2 p-3 border rounded-lg">
                    <h4 className="font-semibold text-base mb-2">Finanzas ({selectedTeam.finances.peb.toFixed(2)} PEB)</h4>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {selectedTeam.finances.pebBreakdown.map((line, i) => <li key={`fin-${i}`}>{line}</li>)}
                    </ul>
                    <Separator />
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo PEB:</p>
                        <p className="text-center">
                          (${parsePebBreakdown(selectedTeam.finances.pebBreakdown).map(item => `${item.label}: ${item.value.toFixed(2)}`).join(' + ')})
                           / {selectedTeam.finances.pebBreakdown.length} = <span className="font-bold">{selectedTeam.finances.peb.toFixed(2)}</span>
                        </p>
                    </div>
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo XP:</p>
                        <p>{`(${selectedTeam.finances.peb.toFixed(2)}/100 * 26.67) + ${(selectedTeam.xpFinancesBonus ?? 0).toFixed(2)} XP ${getBonusSourceNames(selectedTeam, 'finances')} = ${selectedTeam.finances.xp.toFixed(2)} XP`} {selectedTeam.finances.xp >= 29.33 && <span className="text-xs text-primary font-semibold">(MAX 110%)</span>}</p>
                    </div>
                 </div>
                 <div className="space-y-2 p-3 border rounded-lg">
                    <h4 className="font-semibold text-base mb-2">Reputación ({selectedTeam.reputation.peb.toFixed(2)} PEB)</h4>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {selectedTeam.reputation.pebBreakdown.map((line, i) => <li key={`rep-${i}`}>{line}</li>)}
                    </ul>
                    <Separator />
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo PEB:</p>
                        <p className="text-center">
                          (${parsePebBreakdown(selectedTeam.reputation.pebBreakdown).map(item => `${item.label}: ${item.value.toFixed(2)}`).join(' + ')})
                           / {selectedTeam.reputation.pebBreakdown.length} = <span className="font-bold">{selectedTeam.reputation.peb.toFixed(2)}</span>
                        </p>
                    </div>
                     <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo XP:</p>
                        <p>{`(${selectedTeam.reputation.peb.toFixed(2)}/100 * 26.67) + ${(selectedTeam.xpReputationBonus ?? 0).toFixed(2)} XP ${getBonusSourceNames(selectedTeam, 'reputation')} = ${selectedTeam.reputation.xp.toFixed(2)} XP`} {selectedTeam.reputation.xp >= 29.33 && <span className="text-xs text-primary font-semibold">(MAX 110%)</span>}</p>
                    </div>
                 </div>
                 <div className="space-y-2 p-3 border rounded-lg">
                    <h4 className="font-semibold text-base mb-2">Moral ({selectedTeam.morale.peb.toFixed(2)} PEB)</h4>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {selectedTeam.morale.pebBreakdown.map((line, i) => <li key={`mor-${i}`}>{line}</li>)}
                    </ul>
                     <Separator />
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo PEB:</p>
                        <p className="text-center">
                          (${parsePebBreakdown(selectedTeam.morale.pebBreakdown).map(item => `${item.label}: ${item.value.toFixed(2)}`).join(' + ')})
                           / {selectedTeam.morale.pebBreakdown.length} = <span className="font-bold">{selectedTeam.morale.peb.toFixed(2)}</span>
                        </p>
                    </div>
                     <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo XP:</p>
                        <p>{`(${selectedTeam.morale.peb.toFixed(2)}/100 * 26.67) + ${(selectedTeam.xpMoraleBonus ?? 0).toFixed(2)} XP ${getBonusSourceNames(selectedTeam, 'morale')} = ${selectedTeam.morale.xp.toFixed(2)} XP`} {selectedTeam.morale.xp >= 29.33 && <span className="text-xs text-primary font-semibold">(MAX 110%)</span>}</p>
                    </div>
                 </div>
              </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setPebDetailOpen(false)}>Cerrar</Button>
               </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDecisionDetailOpen} onOpenChange={setDecisionDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedTeam && fullDecisionsForDialog && (
            <>
              <DialogHeader>
                <DialogTitle>Decisiones de Ronda: {selectedTeam.name}</DialogTitle>
                 <DialogDescription>Decisiones tomadas por el equipo en la ronda {currentRoundTab}.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                
                {/* Investments and Center Actions */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-base">Inversiones y Acciones</h4>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Decisión</TableHead>
                                <TableHead className="text-right w-[120px]">Coste</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(fullDecisionsForDialog.actions || []).length === 0 ? (
                                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No se realizaron inversiones ni acciones.</TableCell></TableRow>
                                ) : (
                                    (fullDecisionsForDialog.actions || []).map(actionId => {
                                        const investmentInfo = allInvestments.find(inv => inv.id === actionId);
                                        const centerActionInfo = centerActionsMap[actionId];
                                        
                                        const name = investmentInfo?.name || centerActionInfo?.name || actionId;
                                        
                                        const cost = fullDecisionsForDialog.investmentCosts?.[actionId] ?? 
                                                     (investmentInfo?.cost.type === 'fixed' ? investmentInfo.cost.value as number :
                                                      investmentInfo?.cost.type === 'range' ? (investmentInfo.cost.value as [number, number])[1] :
                                                      centerActionInfo ? centerActionInfo.cost : undefined);

                                        return (
                                            <TableRow key={actionId}>
                                                <TableCell>{name}</TableCell>
                                                <TableCell className="text-right font-mono">{cost !== undefined ? `${formatCurrency(cost)} CC` : '--'}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-base">Precio de Matrícula</h4>
                    <p className="font-mono text-lg p-3 bg-muted rounded-md w-fit">{formatCurrency(fullDecisionsForDialog.tuitionPrice)} CC</p>
                </div>

                <Separator />

                {/* Crisis Response */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-base">Respuesta a Crisis</h4>
                     {fullDecisionsForDialog.crisisResponse ? (
                         <div className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Crisis</Label>
                                <p className="font-medium">{fullDecisionsForDialog.crisisResponse.crisisName}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Opción Elegida</Label>
                                <p className="font-medium">{fullDecisionsForDialog.crisisResponse.option}</p>
                            </div>
                             <div>
                                <Label className="text-muted-foreground">Justificación del Equipo</Label>
                                <blockquote className="mt-1 border-l-2 pl-6 italic text-sm">
                                    "{fullDecisionsForDialog.crisisResponse.justification}"
                                </blockquote>
                            </div>
                             <div className="flex justify-between items-center bg-muted/50 rounded-md p-3">
                                 <span className="font-medium">Coste de la Opción:</span>
                                 <span className="font-mono font-bold text-red-600">{formatCurrency(fullDecisionsForDialog.crisisResponse.cost)} CC</span>
                             </div>
                         </div>
                     ) : (
                        <p className="text-sm text-muted-foreground">No hubo crisis para este equipo en esta ronda.</p>
                     )}
                </div>

              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDecisionDetailOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isKpiEditorOpen} onOpenChange={setKpiEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar KPIs para {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Ajusta manualmente los KPIs del equipo para la ronda {currentRoundTab}. Usa esto con precaución.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {editingKpis && Object.keys(editingKpis).map((key) => (
                <div key={key} className="space-y-2">
                    <Label htmlFor={`kpi-${key}`}>{key}</Label>
                    <Input
                        id={`kpi-${key}`}
                        type="number"
                        value={editingKpis[key as keyof TeamKPIs] as number ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setEditingKpis(prev => prev ? {
                                ...prev,
                                [key]: value === '' ? undefined : Number(value)
                            } : null);
                        }}
                    />
                </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSaveKpis}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
