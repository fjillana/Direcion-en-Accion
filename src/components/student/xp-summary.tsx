
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Shield, Heart } from "lucide-react";

interface XpCardProps {
  title: string;
  xp: number;
  icon: React.ReactNode;
}

function XpCard({ title, xp, icon }: XpCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold">{xp} XP</p>
      </div>
    </div>
  );
}

interface XpSummaryProps {
    xpFinanzas: number;
    xpReputacion: number;
    xpMoral: number;
    xpTotal: number;
}

export function XpSummary({ xpFinanzas, xpReputacion, xpMoral, xpTotal }: XpSummaryProps) {
    const xpRonda = xpFinanzas + xpReputacion + xpMoral;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen de Puntuación</CardTitle>
                <CardDescription>Puntos de Experiencia (XP) obtenidos en la ronda y totales.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">XP de esta Ronda: <span className="text-primary">{xpRonda} XP</span></h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <XpCard title="Finanzas" xp={xpFinanzas} icon={<DollarSign className="h-5 w-5 text-emerald-600" />} />
                        <XpCard title="Reputación" xp={xpReputacion} icon={<Shield className="h-5 w-5 text-blue-600" />} />
                        <XpCard title="Moral" xp={xpMoral} icon={<Heart className="h-5 w-5 text-red-600" />} />
                    </div>
                </div>
                 <div className="flex items-center justify-center rounded-lg bg-muted/50 p-4">
                    <div className="text-center">
                        <p className="text-lg text-muted-foreground">XP Totales Acumulados</p>
                        <p className="text-5xl font-bold tracking-tight text-primary">{xpTotal}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
