
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
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Resumen del Equipo Beta
        </h1>
        <p className="text-muted-foreground">
          Ronda 1 - ¡Tus decisiones marcarán la diferencia!
        </p>
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
      <Card>
        <CardHeader>
          <CardTitle>Finalizar Ronda</CardTitle>
          <CardDescription>
            Una vez que hayas tomado todas tus decisiones de inversión y respondido a la crisis, puedes finalizar la ronda. Esta acción es irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roundConfirmed ? (
             <div className="flex items-center justify-center p-8 rounded-lg bg-muted border border-dashed">
                <div className="text-center">
                    <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Decisiones Enviadas</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Has confirmado tus decisiones para esta ronda. Espera a que el profesor procese los resultados.</p>
                </div>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" size="lg">Finalizar y Confirmar Ronda</Button>
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
        </CardContent>
      </Card>
      <div className="w-full">
        <CrisisForm disabled={roundConfirmed} />
      </div>
    </div>
  );
}
