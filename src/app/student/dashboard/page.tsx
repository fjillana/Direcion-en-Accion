
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/student/kpi-card";
import { CrisisForm } from "@/components/student/crisis-form";
import { useState } from "react";
import { Lock } from "lucide-react";

export default function StudentDashboard() {
  const [roundConfirmed, setRoundConfirmed] = useState(false);

  return (
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Saldo de tesorería" value="25,000 CC" trend="up" change="+2.5%" />
        <KpiCard
          title="Coste personal / Ingresos"
          value="75%"
          trend="down"
          change="-1.0%"
        />
        <KpiCard title="Nota Media Alumnado" value="7.5" trend="up" change="+0.1" />
        <KpiCard
          title="Cuota de mercado"
          value="12.5%"
          trend="up"
          change="+0.5%"
        />
        <KpiCard title="Moral del personal" value="100%" trend="up" change="0%" />
        <KpiCard title="Ratio Alumnos/Profesor" value="25.0" trend="down" change="-0.5" />
      </div>
      
      <div className="w-full">
        <CrisisForm disabled={roundConfirmed} />
      </div>

    </div>
  );
}
