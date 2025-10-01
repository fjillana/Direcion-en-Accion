
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/student/kpi-card";
import { CrisisForm } from "@/components/student/crisis-form";
import { useState } from "react";
import { Lock } from "lucide-react";
import { KpiChart } from "@/components/student/kpi-chart";
import { StudentGate } from "@/components/student/student-gate";
import { XpSummary } from "@/components/student/xp-summary";

const kpiHistoryData = {
  cash: [
    { round: 0, value: 50000 },
    { round: 1, value: 45000 },
    { round: 2, value: 65000 },
    { round: 3, value: 25000 },
  ],
  personnelCost: [
    { round: 0, value: 70 },
    { round: 1, value: 72 },
    { round: 2, value: 78 },
    { round: 3, value: 75 },
  ],
  nma: [
    { round: 0, value: 7.0 },
    { round: 1, value: 7.2 },
    { round: 2, value: 7.4 },
    { round: 3, value: 7.5 },
  ],
  marketShare: [
    { round: 0, value: 10 },
    { round: 1, value: 11.5 },
    { round: 2, value: 12 },
    { round: 3, value: 12.5 },
  ],
  morale: [
    { round: 0, value: 80 },
    { round: 1, value: 75 },
    { round: 2, value: 90 },
    { round: 3, value: 100 },
  ],
  studentTeacherRatio: [
    { round: 0, value: 26.0 },
    { round: 1, value: 25.8 },
    { round: 2, value: 25.5 },
    { round: 3, value: 25.0 },
  ],
};


export default function StudentDashboard() {
  const [roundConfirmed, setRoundConfirmed] = useState(false);

  return (
    <StudentGate>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              Resumen del Equipo Beta
            </h1>
            <p className="text-muted-foreground">
              Ronda 1 - ¡Tus decisiones marcarán la diferencia!
            </p>
          </div>
          <div className="text-right">
            {roundConfirmed ? (
              <div className="flex items-center justify-center p-4 rounded-lg bg-muted border border-dashed">
                  <div className="text-center">
                      <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-2 text-base font-semibold">Decisiones Enviadas</h3>
                  </div>
              </div>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Finalizar y Confirmar Ronda</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres finalizar la ronda?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible. Una vez confirmes, no podrás cambiar tus decisiones de inversión ni tu respuesta a la crisis para esta ronda. Tus decisiones se enviarán al profesor para su procesamiento.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setRoundConfirmed(true)}>Sí, finalizar ronda</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <p className="text-xs text-muted-foreground mt-2">Esta acción es irreversible para la ronda actual.</p>
          </div>
        </div>

        <XpSummary 
          xpFinanzas={21}
          xpReputacion={22}
          xpMoral={20}
          xpTotal={63}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Dialog>
            <DialogTrigger asChild>
              <div>
                <KpiCard title="Saldo de tesorería" value="25,000 CC" trend="up" change="+2.5%" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Evolución del Saldo de Tesorería</DialogTitle>
                <DialogDescription>
                  Historial de la tesorería de tu equipo a lo largo de las rondas.
                </DialogDescription>
              </DialogHeader>
              <KpiChart data={kpiHistoryData.cash} dataKey="value" unit=" CC" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <KpiCard title="Coste personal / Ingresos" value="75%" trend="down" change="-1.0%" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Evolución del Coste de Personal</DialogTitle>
                <DialogDescription>
                  Historial del ratio de coste de personal sobre ingresos.
                </DialogDescription>
              </DialogHeader>
              <KpiChart data={kpiHistoryData.personnelCost} dataKey="value" unit="%" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <KpiCard title="Nota Media Alumnado" value="7.5" trend="up" change="+0.1" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Evolución de la Nota Media del Alumnado</DialogTitle>
                <DialogDescription>
                  Historial de la nota media de los alumnos.
                </DialogDescription>
              </DialogHeader>
              <KpiChart data={kpiHistoryData.nma} dataKey="value" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                  <KpiCard title="Cuota de mercado" value="12.5%" trend="up" change="+0.5%" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Evolución de la Cuota de Mercado</DialogTitle>
                <DialogDescription>
                  Historial de la cuota de mercado de tu equipo.
                </DialogDescription>
              </DialogHeader>
              <KpiChart data={kpiHistoryData.marketShare} dataKey="value" unit="%" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <KpiCard title="Moral del personal" value="100%" trend="up" change="0%" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Evolución de la Moral del Personal</DialogTitle>
                <DialogDescription>
                  Historial de la moral del equipo docente.
                </DialogDescription>
              </DialogHeader>
              <KpiChart data={kpiHistoryData.morale} dataKey="value" unit="%" />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <div>
                <KpiCard title="Ratio Alumnos/Profesor" value="25.0" trend="down" change="-0.5" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Evolución del Ratio Alumnos/Profesor</DialogTitle>
                <DialogDescription>
                  Historial del ratio de alumnos por cada profesor.
                </DialogDescription>
              </DialogHeader>
              <KpiChart data={kpiHistoryData.studentTeacherRatio} dataKey="value" />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="w-full">
          <CrisisForm disabled={roundConfirmed} />
        </div>

      </div>
    </StudentGate>
  );
}
