
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Shield, Heart } from "lucide-react";

type PebData = {
  total: number;
  breakdown: string[];
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
  data: XpData[];
}

interface XpCardProps {
  title: string;
  xp: number;
  icon: React.ReactNode;
  pebData: PebData;
  round: number;
}

function XpCard({ title, xp, icon, pebData, round }: XpCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex cursor-pointer items-center gap-4 rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted/80">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border bg-background">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{xp} XP</p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desglose de PEB: {title} (Ronda {round})</DialogTitle>
          <DialogDescription>
            Puntos de Experiencia Base (PEB) obtenidos: <span className="font-bold">{pebData.total}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-4">
            <h4 className="font-semibold">Cálculo:</h4>
            <ul className="list-disc space-y-1 rounded-md border bg-muted/50 p-4 pl-8 text-sm text-muted-foreground">
                {pebData.breakdown.map((line, index) => <li key={index}>{line}</li>)}
            </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function XpSummary({ data }: XpSummaryProps) {
  const latestRound = Math.max(...data.map(d => d.round));
  const [selectedRound, setSelectedRound] = useState<number>(latestRound);

  const currentData = useMemo(() => {
    return data.find(d => d.round === selectedRound) || data[data.length - 1];
  }, [data, selectedRound]);

  const xpRonda = currentData.xpFinanzas + currentData.xpReputacion + currentData.xpMoral;

  const averageXp = useMemo(() => {
    if (data.length === 0) return 0;
    const totalXp = data.reduce((acc, roundData) => {
        return acc + roundData.xpFinanzas + roundData.xpReputacion + roundData.xpMoral;
    }, 0);
    return (totalXp / data.length).toFixed(1);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Resumen de Puntuación</CardTitle>
                <CardDescription>Puntos de Experiencia (XP) obtenidos.</CardDescription>
            </div>
            <div className="mt-2 sm:mt-0">
                <Select value={String(selectedRound)} onValueChange={(val) => setSelectedRound(Number(val))}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccionar Ronda" />
                    </SelectTrigger>
                    <SelectContent>
                        {data.map(d => (
                            <SelectItem key={d.round} value={String(d.round)}>Ronda {d.round}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">XP de la Ronda {selectedRound}: <span className="text-primary">{xpRonda} XP</span></h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <XpCard title="Finanzas" xp={currentData.xpFinanzas} icon={<DollarSign className="h-6 w-6 text-emerald-600" />} pebData={currentData.pebFinanzas} round={selectedRound} />
            <XpCard title="Reputación" xp={currentData.xpReputacion} icon={<Shield className="h-6 w-6 text-blue-600" />} pebData={currentData.pebReputacion} round={selectedRound} />
            <XpCard title="Moral" xp={currentData.xpMoral} icon={<Heart className="h-6 w-6 text-red-600" />} pebData={currentData.pebMoral} round={selectedRound} />
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
