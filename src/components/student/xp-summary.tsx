
"use client";

import { useState, useMemo } from "react";
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

function XpCard({ title, xp, icon, peb, pebBreakdown, round, bonusXp, bonusSource }: XpCardProps) {
    const calculatedXp = (peb * (80 / 3) / 100);
    const finalCalculation = `(${pebBreakdown.map(b => b.split(':')[1].trim().split(' ')[0]).join(' + ')}) / ${pebBreakdown.length} = ${peb.toFixed(2)}`;
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
                 <div className="rounded-md border bg-muted/50 p-4 font-mono text-center text-foreground">
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

const getBonusSourceName = (team: TeamPerformanceData, area: 'finances' | 'reputation' | 'morale'): string => {
    if (!team || !team.decisions?.actions) return "(Bonus)";

    const areaInvestments = (team.decisions.actions)
      .map(actionId => allInvestments.find(inv => inv.id === actionId))
      .filter((inv): inv is Investment => !!inv && !!inv.xpBonus[area]);

    if (areaInvestments.length === 0) return "";

    const mainContributor = areaInvestments.reduce((max, current) => {
        const maxBonusConfig = max.xpBonus[area];
        const currentBonusConfig = current.xpBonus[area];
        
        const maxBonusValue = Array.isArray(maxBonusConfig) ? maxBonusConfig[1] : maxBonusConfig;
        const currentBonusValue = Array.isArray(currentBonusConfig) ? currentBonusConfig[1] : currentBonusConfig;
        
        return (currentBonusValue ?? 0) > (maxBonusValue ?? 0) ? current : max;
    });

    return `(${mainContributor.name})`;
};


export function XpSummary({ performanceHistory }: XpSummaryProps) {

  const latestRoundNumber = useMemo(() => {
    if (!performanceHistory || performanceHistory.length === 0) return 0;
    return performanceHistory.reduce((max, p) => p.round > max ? p.round : max, 0);
  }, [performanceHistory]);

  const [selectedRound, setSelectedRound] = useState<number>(latestRoundNumber);

  // Update selectedRound if performanceHistory changes and the current selection is out of sync
  useState(() => {
    if (latestRoundNumber !== selectedRound) {
        setSelectedRound(latestRoundNumber);
    }
  });


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
              bonusSource={getBonusSourceName(selectedRoundData, 'finances')}
            />
            <XpCard 
              title="Reputación" 
              xp={selectedRoundData.reputation.xp} 
              icon={<Shield className="h-5 w-5 text-blue-600" />} 
              peb={selectedRoundData.reputation.peb} 
              pebBreakdown={selectedRoundData.reputation.pebBreakdown} 
              round={selectedRound}
              bonusXp={selectedRoundData.xpReputationBonus}
              bonusSource={getBonusSourceName(selectedRoundData, 'reputation')}
            />
            <XpCard 
              title="Moral" 
              xp={selectedRoundData.morale.xp} 
              icon={<Heart className="h-5 w-5 text-red-600" />} 
              peb={selectedRoundData.morale.peb} 
              pebBreakdown={selectedRoundData.morale.pebBreakdown} 
              round={selectedRound}
              bonusXp={selectedRoundData.xpMoraleBonus}
              bonusSource={getBonusSourceName(selectedRoundData, 'morale')}
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
