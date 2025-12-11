
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
import { CenterDataForm } from "@/components/student/center-data-form";
import { Lock, Info, EyeOff } from "lucide-react";
import { KpiChart } from "@/components/student/kpi-chart";
import { StudentGate } from "@/components/student/student-gate";
import { XpSummary } from "@/components/student/xp-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useGames } from "@/hooks/use-games";
import { CrisisReport } from "@/components/student/crisis-report";
import { crises as allCrises } from "@/app/teacher/catalog/crises-data";
import type { Crisis } from "@/components/teacher/catalog-editor";

export default function StudentDashboard() {
  const { studentGame, setRoundDecisions } = useStudentGame();
  const { confirmStudentDecisions } = useGames();

  const { decisions, kpis, performanceHistory, round, planConfirmed, isBlindRound } = studentGame || {};
  
  const roundConfirmed = decisions?.roundConfirmed || false;

  const handleConfirmRound = () => {
    if (!decisions || !studentGame || !studentGame.gameId || !studentGame.teamName || studentGame.round === undefined) {
      console.error("Attempted to confirm round with incomplete game state.", studentGame);
      return;
    }

    const confirmedDecisions = { ...decisions, roundConfirmed: true };
    setRoundDecisions(confirmedDecisions);
  }

  const kpiHistoryData = useMemo(() => {
    if (!performanceHistory) return {};
    
    const history: Record<string, { round: number, value: number }[]> = {
      cash: [],
      personnelCost: [],
      nma: [],
      marketShare: [],
      morale: [],
      studentTeacherRatio: [],
    };

    performanceHistory.forEach(perf => {
      history.cash.push({ round: perf.round, value: perf.kpis.cash });
      history.personnelCost.push({ round: perf.round, value: perf.kpis.income > 0 ? (perf.kpis.personnelCost / perf.kpis.income) * 100 : 0 });
      history.nma.push({ round: perf.round, value: perf.kpis.nma });
      history.marketShare.push({ round: perf.round, value: perf.kpis.marketShare });
      history.morale.push({ round: perf.round, value: perf.kpis.morale });
      history.studentTeacherRatio.push({ round: perf.round, value: perf.kpis.studentTeacherRatio });
    });
    
    return history;

  }, [performanceHistory]);
  
  const getTrend = (data: {round: number, value: number}[]) => {
      if(data.length < 2) return { trend: "up" as "up" | "down", change: "N/A"};
      const last = data[data.length-1].value;
      const prev = data[data.length-2].value;
      const diff = last - prev;
      return {
          trend: diff >= 0 ? "up" as "up" : "down" as "down",
          change: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`
      }
  }

  const currentCrisisId = useMemo(() => {
    if (!studentGame || !studentGame.roundSettings || studentGame.round === undefined) {
      return undefined;
    }
    const roundKey = studentGame.round.toString();
    const settingsForRound = studentGame.roundSettings[roundKey];
    if (!settingsForRound || !settingsForRound.teamCrises) {
      return undefined;
    }
    return settingsForRound.teamCrises.find(tc => tc.teamName === studentGame.teamName)?.crisisIds[0];
  }, [studentGame]);

  const lastCrisisReport = useMemo(() => {
    if (!performanceHistory || performanceHistory.length === 0 || round === undefined) return null;
    
    const previousRound = round - 1;
    if (previousRound < 0) return null;

    const lastRoundPerformance = performanceHistory.find(p => p.round === previousRound);
    
    if (lastRoundPerformance && lastRoundPerformance.decisions.crisisResponse) {
      return lastRoundPerformance.decisions.crisisResponse;
    }

    return null;
  }, [performanceHistory, round]);

  const currentCrisis = currentCrisisId ? allCrises.find(c => c.id === currentCrisisId) : undefined;
  
  const isRoundZero = round === 0;

  const previousTuitionPrice = useMemo(() => {
    if (!performanceHistory || round === undefined || round === 0) {
        // For round 0, there is no previous price, but we can set a base for the 30% rule.
        return 120;
    }
    const lastRoundPerformance = performanceHistory.find(p => p.round === round - 1);
    return lastRoundPerformance?.decisions.tuitionPrice;
  }, [performanceHistory, round]);


  if (isRoundZero && !planConfirmed) {
    return (
       <StudentGate>
        <div className="space-y-6">
           <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle className="font-bold">Bienvenido a la Ronda 0: Planificación Estratégica</AlertTitle>
              <AlertDescription>
                  <p>¡Es hora de definir el futuro de tu centro! En esta ronda inicial, tu tarea principal es establecer tus objetivos a largo plazo en el Plan Estratégico.</p>
                  <p className="mt-2">Una vez que confirmes tu plan, estas decisiones quedarán bloqueadas. ¡Planifica con sabiduría!</p>
                   <Button asChild className="mt-4">
                      <Link href="/student/strategic-plan">Ir al Plan Estratégico</Link>
                   </Button>
              </AlertDescription>
           </Alert>
           {!isBlindRound && <XpSummary performanceHistory={performanceHistory || []} />}
        </div>
       </StudentGate>
    )
  }
  
  return (
    <StudentGate>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              Resumen del Equipo {studentGame?.teamName || 'Beta'}
            </h1>
            <p className="text-muted-foreground">
              Ronda {studentGame?.round || 0} - ¡Tus decisiones marcarán la diferencia!
            </p>
          </div>
          <div className="text-right">
            {roundConfirmed ? (
              <div className="flex items-center justify-center p-4 rounded-lg bg-muted border border-dashed">
                  <div className="text-center">
                      <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-2 text-base font-semibold">Decisiones Enviadas</h3>
                      <p className="text-sm text-muted-foreground">Esperando al profesor...</p>
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
                    <AlertDialogAction onClick={handleConfirmRound}>Sí, finalizar ronda</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <p className="text-xs text-muted-foreground mt-2">Esta acción es irreversible para la ronda actual.</p>
          </div>
        </div>
        
        {isBlindRound && (
          <Alert variant="destructive">
            <EyeOff className="h-4 w-4" />
            <AlertTitle className="font-bold">Ronda a Ciegas Activada</AlertTitle>
            <AlertDescription>
              La información de KPIs, reportes y puntuación está oculta en esta ronda. Toma tus decisiones basándote en los datos del centro y los resultados financieros que puedes deducir.
            </AlertDescription>
          </Alert>
        )}

        {!isBlindRound && <XpSummary performanceHistory={performanceHistory || []} />}
        
        {!isBlindRound && (
            <Card>
            <CardHeader>
                <CardTitle>KPIs Actuales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Dialog>
                    <DialogTrigger asChild>
                    <div>
                        <KpiCard title="Saldo de tesorería" value={`${(kpis?.cash || 0).toLocaleString('es-ES')} CC`} {...getTrend(kpiHistoryData.cash || [])} />
                    </div>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evolución del Saldo de Tesorería</DialogTitle>
                        <DialogDescription>
                        Historial de la tesorería de tu equipo a lo largo de las rondas.
                        </DialogDescription>
                    </DialogHeader>
                    <KpiChart data={kpiHistoryData.cash || []} dataKey="value" unit=" CC" />
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                    <div>
                        <KpiCard title="Coste personal / Ingresos" value={`${kpis?.income && kpis.income > 0 ? ((kpis.personnelCost / kpis.income) * 100).toFixed(1) : '0.0'}%`} {...getTrend(kpiHistoryData.personnelCost || [])} />
                    </div>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evolución del Coste de Personal</DialogTitle>
                        <DialogDescription>
                        Historial del ratio de coste de personal sobre ingresos.
                        </DialogDescription>
                    </DialogHeader>
                    <KpiChart data={kpiHistoryData.personnelCost || []} dataKey="value" unit="%" />
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                    <div>
                        <KpiCard title="Nota Media Alumnado" value={`${(kpis?.nma || 0).toFixed(1)}`} {...getTrend(kpiHistoryData.nma || [])} />
                    </div>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evolución de la Nota Media del Alumnado</DialogTitle>
                        <DialogDescription>
                        Historial de la nota media de los alumnos.
                        </DialogDescription>
                    </DialogHeader>
                    <KpiChart data={kpiHistoryData.nma || []} dataKey="value" />
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                    <div>
                        <KpiCard title="Cuota de mercado" value={`${(kpis?.marketShare || 0).toFixed(1)}%`} {...getTrend(kpiHistoryData.marketShare || [])} />
                    </div>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evolución de la Cuota de Mercado</DialogTitle>
                        <DialogDescription>
                        Historial de la cuota de mercado de tu equipo.
                        </DialogDescription>
                    </DialogHeader>
                    <KpiChart data={kpiHistoryData.marketShare || []} dataKey="value" unit="%" />
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                    <div>
                        <KpiCard title="Moral del personal" value={`${(kpis?.morale || 0).toFixed(0)}%`} {...getTrend(kpiHistoryData.morale || [])} />
                    </div>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evolución de la Moral del Personal</DialogTitle>
                        <DialogDescription>
                        Historial de la moral del equipo docente.
                        </DialogDescription>
                    </DialogHeader>
                    <KpiChart data={kpiHistoryData.morale || []} dataKey="value" unit="%" />
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                    <div>
                        <KpiCard title="Ratio Alumnos/Profesor" value={`${(kpis?.studentTeacherRatio || 0).toFixed(1)}`} {...getTrend(kpiHistoryData.studentTeacherRatio || [])} />
                    </div>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Evolución del Ratio Alumnos/Profesor</DialogTitle>
                        <DialogDescription>
                        Historial del ratio de alumnos por cada profesor.
                        </DialogDescription>
                    </DialogHeader>
                    <KpiChart data={kpiHistoryData.studentTeacherRatio || []} dataKey="value" />
                    </DialogContent>
                </Dialog>
                </div>
            </CardContent>
            </Card>
        )}
        
        <CenterDataForm 
          disabled={roundConfirmed} 
          selectedActions={decisions?.actions || []}
          onActionChange={(actions) => setRoundDecisions({ actions })}
          tuitionPrice={decisions?.tuitionPrice || 120}
          onPriceChange={(price) => setRoundDecisions({ tuitionPrice: price })}
          numStudents={kpis?.numStudents || 0}
          numTeachers={kpis?.numTeachers || 0}
          capacity={kpis?.capacity || 810}
          previousTuitionPrice={previousTuitionPrice}
        />
        
        {!isBlindRound && lastCrisisReport && (
          <div className="w-full">
            <CrisisReport report={lastCrisisReport} />
          </div>
        )}

        {currentCrisis && (
          <div className="w-full">
            <CrisisForm 
              disabled={roundConfirmed}
              onResponseChange={(response) => setRoundDecisions({ crisisResponse: response })}
              currentResponse={decisions?.crisisResponse || null}
              {...currentCrisis} 
            />
          </div>
        )}

      </div>
    </StudentGate>
  );
}
