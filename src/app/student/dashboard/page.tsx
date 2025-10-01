

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
import { CrisisForm, type CrisisProps } from "@/components/student/crisis-form";
import { CenterDataForm } from "@/components/student/center-data-form";
import { InvestmentForm, availableInvestments } from "@/components/student/investment-form";
import { useState } from "react";
import { Lock } from "lucide-react";
import { KpiChart } from "@/components/student/kpi-chart";
import { StudentGate } from "@/components/student/student-gate";
import { XpSummary, XpData } from "@/components/student/xp-summary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

const xpData: XpData[] = [
  {
    round: 1,
    xpFinanzas: 19,
    xpReputacion: 18,
    xpMoral: 14,
    pebFinanzas: {
      total: 95,
      breakdown: [
        "Tesorería al 7% sobre ingresos -> 100 PEB",
        "Coste Personal sobre ingresos al 76% -> 90 PEB"
      ],
      finalCalculation: "PEB Finanzas = (100 + 90) / 2 = 95"
    },
    pebReputacion: {
      total: 88,
      breakdown: [
        "Nota Media Alumnado (NMA) de 8.2 -> 82 PEB",
        "Cuota de Mercado del 12% -> 94 PEB"
      ],
      finalCalculation: "PEB Reputación = (82 + 94) / 2 = 88"
    },
    pebMoral: {
      total: 85.5,
      breakdown: [
        "Moral del personal al 71% -> 71 PEB",
        "Ratio Alumno/Profesor de 25.1 -> 100 PEB"
      ],
       finalCalculation: "PEB Moral = (71 + 100) / 2 = 85.5"
    },
  },
  {
    round: 2,
    xpFinanzas: 21,
    xpReputacion: 22,
    xpMoral: 20,
    pebFinanzas: {
      total: 105,
      breakdown: ["Tesorería (11%): 110 PEB", "Coste Personal (72%): 100 PEB"],
      finalCalculation: "PEB Finanzas = (110 + 100) / 2 = 105"
    },
    pebReputacion: {
      total: 110,
      breakdown: ["NMA (9.2): 115 PEB", "Cuota Mercado (13.5%): 105 PEB"],
      finalCalculation: "PEB Reputación = (115 + 105) / 2 = 110"
    },
    pebMoral: {
      total: 98,
      breakdown: ["Moral (78%): 78 PEB", "Ratio Alumno/Prof (24.0): 118 PEB"],
      finalCalculation: "PEB Moral = (78 + 118) / 2 = 98"
    },
  },
   {
    round: 3,
    xpFinanzas: 22,
    xpReputacion: 23,
    xpMoral: 20,
    pebFinanzas: {
      total: 110,
      breakdown: ["Tesorería (15%): 120 PEB", "Coste Personal (68%): 100 PEB"],
      finalCalculation: "PEB Finanzas = (120 + 100) / 2 = 110"
    },
    pebReputacion: {
      total: 115,
      breakdown: ["NMA (9.8): 120 PEB", "Cuota Mercado (15%): 110 PEB"],
      finalCalculation: "PEB Reputación = (120 + 110) / 2 = 115"
    },
    pebMoral: {
      total: 100,
      breakdown: ["Moral (85%): 85 PEB", "Ratio Alumno/Prof (23.5): 115 PEB"],
      finalCalculation: "PEB Moral = (85 + 115) / 2 = 100"
    },
  },
];

const currentCrisis: CrisisProps = {
  id: "C1",
  title: "¡Evento de Crisis! - Huelga docente",
  description: "La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza. Debes tomar una decisión.",
  options: [
    { id: 'op1', label: 'Aceptar todas las demandas (-25.000 CC)' },
    { id: 'op2', label: 'Negociar un acuerdo parcial (-15.000 CC)' },
    { id: 'op3', label: 'Mantener la postura' },
    { id: 'op4', label: 'Recurrir a mediadores externos (-8.000 CC)' },
    { id: 'op5', label: 'Despedir a los líderes del sindicato (-10.000 CC)' },
  ]
};

export default function StudentDashboard() {
  const [roundConfirmed, setRoundConfirmed] = useState(false);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [selectedCenterActions, setSelectedCenterActions] = useState<string[]>([]);
  const [tuitionPrice, setTuitionPrice] = useState(120);

  const centerActionsCosts = {
    'P2': 7500, // Contratar Docente
    'P7': 7500, // Despedir Docente
    'F5': 50000, // Ampliación de Aulas
  };

  const investmentCosts = selectedInvestments.reduce((acc, id) => {
    const investment = availableInvestments.find(inv => inv.id === id);
    return acc + (investment?.cost || 0);
  }, 0);
  
  const centerActionCosts = selectedCenterActions.reduce((acc, id) => {
    return acc + (centerActionsCosts[id as keyof typeof centerActionsCosts] || 0);
  }, 0);

  const totalCost = investmentCosts + centerActionCosts;
  
  return (
    <StudentGate>
      <div className="space-y-8">
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

        <XpSummary data={xpData} />
        
        <Card>
          <CardHeader>
            <CardTitle>KPIs Actuales</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        
        <CenterDataForm 
          disabled={roundConfirmed} 
          selectedActions={selectedCenterActions}
          onActionChange={setSelectedCenterActions}
          tuitionPrice={tuitionPrice}
          onPriceChange={setTuitionPrice}
        />
        
        <InvestmentForm 
          disabled={roundConfirmed}
          selectedInvestments={selectedInvestments}
          onInvestmentChange={setSelectedInvestments}
          totalOtherCosts={centerActionCosts}
        />

        <div className="w-full">
          <CrisisForm disabled={roundConfirmed} {...currentCrisis} />
        </div>

      </div>
    </StudentGate>
  );
}

    