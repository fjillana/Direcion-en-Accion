
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Shield, Heart, Info } from "lucide-react";
import { Button } from "../ui/button";
import type { TeamPerformanceData } from "@/hooks/use-games";
import { Alert, AlertTitle } from "../ui/alert";
import { investments as allInvestments } from '@/app/teacher/catalog/investment-data';
import type { Investment } from "@/components/teacher/catalog-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type PebData = {
  total: number;
  breakdown: string[];
  finalCalculation: string;
};

export type XpData = {
  round: number;
  xpFinanzas: number;
  xpReputacion: number;
  xpMoral: number;
  pebFinanzas: PebData;
  pebReputacion: PebData;
  pebMoral: PebData;
};

interface XpSummaryProps {
  performanceHistory: TeamPerformanceData[];
}

interface XpCardProps {
  title: string;
  xp: number;
  icon: React.ReactNode;
  peb: number;
  pebBreakdown: string[];
  round: number;
  bonusXp: number;
  bonusSource: string;
}

const parsePebBreakdownForFormula = (breakdown: string[]) => {
  return breakdown.map(line => {
    const parts = line.split(':');
    const label = parts[0];
    const value = parseFloat(parts[1].trim().split(' ')[0]);
    return { label, value };
  });
};

function XpCard({ title, xp, icon, peb, pebBreakdown, round, bonusXp, bonusSource }: XpCardProps) {
    const calculatedXp = (peb * (80 / 3) / 100);
    const parsedBreakdown = parsePebBreakdownForFormula(pebBreakdown);
    const finalCalculation = `(${parsedBreakdown.map(item => `${item.label}: ${item.value.toFixed(2)}`).join(' + ')}) / ${parsedBreakdown.length} = ${peb.toFixed(2)}`;
    const isCapped = xp >= 29.33;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted/80 h-28 flex flex-col items-center justify-center">
          <div className="absolute top-2 left-2 text-muted-foreground">
            {icon}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{xp.toFixed(1)} XP</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desglose de PEB: {title} (Ronda {round})</DialogTitle>
          <DialogDescription>
            Análisis detallado de cómo se ha calculado tu puntuación en esta área.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4 text-sm">
            <div>
                <h4 className="font-semibold mb-1">1. Desglose de Puntuación Base (PEB)</h4>
                <ul className="list-disc space-y-1 rounded-md border bg-muted/50 p-4 pl-8 text-muted-foreground">
                    {pebBreakdown.map((line, index) => <li key={index}><span className="text-foreground">{line}</span></li>)}
                </ul>
            </div>
             <div>
                <h4 className="font-semibold mb-1">2. Cálculo del PEB Total del Área</h4>
                 <div className="rounded-md border bg-muted/50 p-4 font-mono text-center text-foreground text-xs">
                    {finalCalculation}
                 </div>
            </div>
            <div>
                <h4 className="font-semibold mb-1">3. Conversión de PEB a Puntos de Experiencia (XP)</h4>
                 <div className="rounded-md border bg-muted/50 p-4 font-mono text-center text-foreground">
                    ({peb.toFixed(2)} PEB * 26.67 / 100) + {(bonusXp ?? 0).toFixed(2)} XP {bonusSource} = <span className="font-bold">{xp.toFixed(2)} XP</span> {isCapped && <span className="text-xs text-primary font-semibold">(MAX 110%)</span>}
                 </div>
                 <p className="text-xs text-center text-muted-foreground mt-2">Nota: Se pueden obtener hasta 80 XP por ronda (26.67 por área) con un PEB de 100, más bonus por decisiones.</p>
            </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const getBonusSourceNames = (team: TeamPerformanceData, area: 'finances' | 'reputation' | 'morale'): string => {
    if (!team?.decisions) return "";

    const sources: string[] = [];

    // Check investment-based bonuses
    (team.decisions.actions || []).forEach(actionId => {
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
        if (actionId === 'P3' && team.decisions.poachingSuccess && area === 'morale') sources.push('Poaching Exitoso');
    });

    // Check crisis-based bonuses/penalties
    const crisisId = team.decisions.crisisResponse?.crisisId;
    const optionId = team.decisions.crisisResponse?.optionId;
    if (crisisId && optionId) {
        // This mapping should ideally come from a central place, but for now, we hardcode it.
        const crisisXpEffects: Record<string, Record<string, Partial<Record<'finances' | 'reputation' | 'morale', number>>>> = {
            'C1': { 'C1_op1': { morale: 5, finances: -5 }, 'C1_op2': { morale: 3, finances: -3 }, 'C1_op3': { finances: -15, reputation: -15, morale: -15 }, 'C1_op4': { morale: 2 }, 'C1_op5': { finances: 5, reputation: -10 } },
            'C2': { 'C2_op2': { reputation: -15 }, 'C2_op3': { reputation: 5, finances: -5 }, 'C2_op5': { finances: 8, reputation: -8 } },
            'C3': { 'C3_op1': { reputation: 2, finances: -2 }, 'C3_op2': { finances: 5, reputation: -5 }, 'C3_op4': { finances: 3, reputation: -4 }, 'C3_op5': { reputation: 3, finances: 2 } },
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


export function XpSummary({ performanceHistory }: XpSummaryProps) {

  const latestRoundNumber = useMemo(() => {
    if (!performanceHistory || performanceHistory.length === 0) return 0;
    return performanceHistory.reduce((max, p) => p.round > max ? p.round : max, 0);
  }, [performanceHistory]);

  const [selectedRound, setSelectedRound] = useState<number>(latestRoundNumber);

  useEffect(() => {
    if (latestRoundNumber !== selectedRound) {
        setSelectedRound(latestRoundNumber);
    }
  }, [latestRoundNumber, selectedRound]);


  if (!performanceHistory || performanceHistory.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen de Puntuación</CardTitle>
            </CardHeader>
             <CardContent>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>¡Comienza la partida!</AlertTitle>
                    <CardDescription>
                        Los resultados y la puntuación de la primera ronda aparecerán aquí una vez que el profesor la procese.
                    </CardDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }
  
  const selectedRoundData = useMemo(() => {
    return performanceHistory.find(p => p.round === selectedRound);
  }, [performanceHistory, selectedRound]);

  const xpRonda = selectedRoundData?.totalXp || 0;

  const averageXp = useMemo(() => {
    const totalXp = performanceHistory.reduce((acc, roundData) => acc + roundData.totalXp, 0);
    return (totalXp / performanceHistory.length).toFixed(1);
  }, [performanceHistory]);
  
  const availableRounds = useMemo(() => {
      return [...new Set(performanceHistory.map(p => p.round))].sort((a,b) => a-b);
  }, [performanceHistory]);

  if (!selectedRoundData) {
      return (
        <Card>
            <CardHeader><CardTitle>Resumen de Puntuación</CardTitle></CardHeader>
            <CardContent><p>No hay datos para la ronda seleccionada.</p></CardContent>
        </Card>
      );
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
                <CardTitle>Resumen de Puntuación</CardTitle>
                <CardDescription>
                    Puntuación de la ronda: <span className="font-bold text-primary">{selectedRound}</span>. XP de la ronda: <span className="font-bold text-primary">{xpRonda.toFixed(1)} XP</span>
                </CardDescription>
            </div>
             <div className="w-full sm:w-[180px]">
                <Select value={selectedRound.toString()} onValueChange={(value) => setSelectedRound(parseInt(value, 10))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar Ronda" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableRounds.map(roundNum => (
                            <SelectItem key={roundNum} value={roundNum.toString()}>Ronda {roundNum}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <XpCard 
              title="Finanzas" 
              xp={selectedRoundData.finances.xp} 
              icon={<DollarSign className="h-5 w-5 text-emerald-600" />} 
              peb={selectedRoundData.finances.peb} 
              pebBreakdown={selectedRoundData.finances.pebBreakdown} 
              round={selectedRound}
              bonusXp={selectedRoundData.xpFinancesBonus}
              bonusSource={getBonusSourceNames(selectedRoundData, 'finances')}
            />
            <XpCard 
              title="Reputación" 
              xp={selectedRoundData.reputation.xp} 
              icon={<Shield className="h-5 w-5 text-blue-600" />} 
              peb={selectedRoundData.reputation.peb} 
              pebBreakdown={selectedRoundData.reputation.pebBreakdown} 
              round={selectedRound}
              bonusXp={selectedRoundData.xpReputationBonus}
              bonusSource={getBonusSourceNames(selectedRoundData, 'reputation')}
            />
            <XpCard 
              title="Moral" 
              xp={selectedRoundData.morale.xp} 
              icon={<Heart className="h-5 w-5 text-red-600" />} 
              peb={selectedRoundData.morale.peb} 
              pebBreakdown={selectedRoundData.morale.pebBreakdown} 
              round={selectedRound}
              bonusXp={selectedRoundData.xpMoraleBonus}
              bonusSource={getBonusSourceNames(selectedRoundData, 'morale')}
            />
          </div>
        </div>
        <div className="flex items-center justify-center rounded-lg bg-muted/50 p-4">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Promedio XP / Ronda</p>
            <p className="text-5xl font-bold tracking-tight text-primary">{averageXp}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    