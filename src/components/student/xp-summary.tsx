
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Shield, Heart, Info } from "lucide-react";
import { Button } from "../ui/button";
import type { TeamPerformanceData } from "@/hooks/use-games";
import { Alert, AlertTitle } from "../ui/alert";


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
}

function XpCard({ title, xp, icon, peb, pebBreakdown, round }: XpCardProps) {
    const calculatedXp = (peb * (80 / 3) / 100);
    const finalCalculation = `(${pebBreakdown.map(b => b.split(':')[1].trim().split(' ')[0]).join(' + ')}) / 2 = ${peb.toFixed(2)}`;

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
                    XP = {peb.toFixed(2)} PEB * (26.67 / 100) = <span className="font-bold">{calculatedXp.toFixed(2)} XP</span>
                 </div>
                 <p className="text-xs text-center text-muted-foreground mt-2">Nota: Se pueden obtener hasta 80 XP por ronda (26.67 por área) con un PEB de 100.</p>
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

export function XpSummary({ performanceHistory }: XpSummaryProps) {

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

  const latestRound = Math.max(...performanceHistory.map(d => d.round));
  const [selectedRound, setSelectedRound] = useState<number>(latestRound);

  const currentData = useMemo(() => {
    return performanceHistory.find(d => d.round === selectedRound) || performanceHistory[performanceHistory.length - 1];
  }, [performanceHistory, selectedRound]);

  const xpRonda = currentData.totalXp;

  const averageXp = useMemo(() => {
    const totalXp = performanceHistory.reduce((acc, roundData) => acc + roundData.totalXp, 0);
    return (totalXp / performanceHistory.length).toFixed(1);
  }, [performanceHistory]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
                <CardTitle>Resumen de Puntuación</CardTitle>
                <CardDescription>
                    XP de la Ronda {selectedRound}: <span className="font-bold text-primary">{xpRonda.toFixed(1)} XP</span>
                </CardDescription>
            </div>
            <div className="mt-4 sm:mt-0">
                <Select value={String(selectedRound)} onValueChange={(val) => setSelectedRound(Number(val))}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Seleccionar Ronda" />
                    </SelectTrigger>
                    <SelectContent>
                        {performanceHistory.map(d => (
                            <SelectItem key={d.round} value={String(d.round)}>Ronda {d.round}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <XpCard title="Finanzas" xp={currentData.finances.xp} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} peb={currentData.finances.peb} pebBreakdown={currentData.finances.pebBreakdown} round={selectedRound} />
            <XpCard title="Reputación" xp={currentData.reputation.xp} icon={<Shield className="h-5 w-5 text-blue-600" />} peb={currentData.reputation.peb} pebBreakdown={currentData.reputation.pebBreakdown} round={selectedRound} />
            <XpCard title="Moral" xp={currentData.morale.xp} icon={<Heart className="h-5 w-5 text-red-600" />} peb={currentData.morale.peb} pebBreakdown={currentData.morale.pebBreakdown} round={selectedRound} />
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
