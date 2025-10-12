

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
import { PlayCircle, Loader2, LogOut } from "lucide-react";
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
} from "@/components/ui/dialog";
import { useParams, useRouter } from 'next/navigation'
import { RoundConfig } from "@/components/teacher/round-config";
import type { Investment, Crisis } from "@/components/teacher/catalog-editor";
import { useGames } from "@/hooks/use-games";
import type { Game, TeamPerformanceData, TeamDecision } from "@/hooks/use-games";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simulateRound } from "@/lib/game-logic/round-simulation";
import { Separator } from "@/components/ui/separator";
import { investments as allInvestments } from "@/app/teacher/catalog/investment-data";
import { crises as fullCrisesList } from "@/app/teacher/catalog/crises-data";


export default function GameDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { games, setActiveGameId, updateGame, updateTeamPerformance, getStudentGamesByGameId } = useGames();
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [currentRoundTab, setCurrentRoundTab] = useState<string>("0");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamPerformanceData | null>(null);
  const [isDecisionDetailOpen, setDecisionDetailOpen] = useState(false);
  const [isPebDetailOpen, setPebDetailOpen] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState("");
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


  const handleProcessRound = async () => {
    setIsProcessing(true);
    if (game) {
      const studentGames = await getStudentGamesByGameId(game.id);

      console.log(`[GPS] 2. Processing Round ${game.round} for Game "${game.name}"`);
      const { performanceData, newMessages } = simulateRound(game, studentGames);
      const nextRound = game.round + 1;

      await updateTeamPerformance(game.id, game.round, performanceData, newMessages);

      if (nextRound > game.numRounds) {
        await updateGame(game.id, { status: "Finalizado" });
      } else {
        await updateGame(game.id, { round: nextRound });
      }
    }
    setIsProcessing(false);
  };
  
  const handleTeamRowClick = (team: TeamPerformanceData) => {
    setSelectedTeam(team);
    setPebDetailOpen(true);
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
    
    if (game.round === 0) return true;

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
      if (game.round > 0 && !allTeamsConfirmed) return true; // Disable if not all teams have confirmed
      if (game.round > game.numRounds) return true; // Game is effectively over
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
  
  const getBonusSourceName = (team: TeamPerformanceData, area: 'finances' | 'reputation' | 'morale'): string => {
      if (!team || !team.decisions?.actions) return "(Bonus)";
  
      const areaInvestments = (team.decisions.actions)
        .map(actionId => allInvestments.find(inv => inv.id === actionId))
        .filter((inv): inv is Investment => !!inv && inv.bonus.area === area);
  
      if (areaInvestments.length === 0) return "";
  
      // Find the investment that contributes the most to the bonus
      const mainContributor = areaInvestments.reduce((max, current) => {
          const maxBonusValue = Array.isArray(max.bonus.value) ? max.bonus.value[1] : max.bonus.value;
          const currentBonusValue = Array.isArray(current.bonus.value) ? current.bonus.value[1] : current.bonus.value;
          return currentBonusValue > maxBonusValue ? current : max;
      });
  
      return `(${mainContributor.name})`;
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitoring">Monitorización</TabsTrigger>
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
                            <TableHead className="w-[100px] text-center">Decisiones</TableHead>
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
                            <TableCell className="text-center">
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTeam(team); setDecisionDetailOpen(true); }}>Ver</Button>
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
                        <p>{`(${selectedTeam.finances.pebBreakdown.map(b => b.split(':')[1].trim().split(' ')[0]).join(' + ')}) / ${selectedTeam.finances.pebBreakdown.length} = ${selectedTeam.finances.peb.toFixed(2)}`}</p>
                    </div>
                    <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo XP:</p>
                        <p>{`(${selectedTeam.finances.peb.toFixed(2)}/100 * 26.67) + ${(selectedTeam.xpFinancesBonus ?? 0).toFixed(2)} XP ${getBonusSourceName(selectedTeam, 'finances')} = ${selectedTeam.finances.xp.toFixed(2)} XP`}</p>
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
                        <p>{`(${selectedTeam.reputation.pebBreakdown.map(b => b.split(':')[1].trim().split(' ')[0]).join(' + ')}) / ${selectedTeam.reputation.pebBreakdown.length} = ${selectedTeam.reputation.peb.toFixed(2)}`}</p>
                    </div>
                     <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo XP:</p>
                        <p>{`(${selectedTeam.reputation.peb.toFixed(2)}/100 * 26.67) + ${(selectedTeam.xpReputationBonus ?? 0).toFixed(2)} XP ${getBonusSourceName(selectedTeam, 'reputation')} = ${selectedTeam.reputation.xp.toFixed(2)} XP`}</p>
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
                        <p>{`(${selectedTeam.morale.pebBreakdown.map(b => b.split(':')[1].trim().split(' ')[0]).join(' + ')}) / ${selectedTeam.morale.pebBreakdown.length} = ${selectedTeam.morale.peb.toFixed(2)}`}</p>
                    </div>
                     <div className="font-mono text-xs bg-muted/50 p-2 rounded-md">
                        <p className="font-semibold">Cálculo XP:</p>
                        <p>{`(${selectedTeam.morale.peb.toFixed(2)}/100 * 26.67) + ${(selectedTeam.xpMoraleBonus ?? 0).toFixed(2)} XP ${getBonusSourceName(selectedTeam, 'morale')} = ${selectedTeam.morale.xp.toFixed(2)} XP`}</p>
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
                                        let cost: number | string = '--';

                                        if (investmentInfo) {
                                            cost = investmentInfo.cost.type === 'fixed' ? investmentInfo.cost.value as number : `~${(investmentInfo.cost.value[1]).toLocaleString('es-ES')}`;
                                        } else if (centerActionInfo) {
                                            cost = centerActionInfo.cost;
                                        }

                                        return (
                                            <TableRow key={actionId}>
                                                <TableCell>{name}</TableCell>
                                                <TableCell className="text-right font-mono">{typeof cost === 'number' ? `${formatCurrency(cost)} CC` : cost}</TableCell>
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
    </>
  );
}
