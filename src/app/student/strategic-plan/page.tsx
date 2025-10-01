
"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';

const kpis = [
  {
    key: 'cash',
    title: 'Saldo de tesorería',
    currentValue: 25000,
    targetValue: 40000,
    min: 0,
    max: 100000,
    step: 5000,
    format: (v: number) => `${v.toLocaleString('es-ES')} CC`,
    advice: "Para aumentar la tesorería, considera la inversión 'Oferta de servicios adicionales' (F7) para generar nuevos ingresos, o renegociar la deuda (F6) para reducir los gastos financieros. Un buen colchón de liquidez te protege de crisis inesperadas."
  },
  {
    key: 'personnelCost',
    title: 'Coste personal / Ingresos',
    currentValue: 75,
    targetValue: 70,
    min: 50,
    max: 90,
    step: 1,
    format: (v: number) => `${v}%`,
    advice: "Mantener este ratio por debajo del 75% es clave. La 'Implantación de ERP' (F1) puede automatizar tareas y reducir costes administrativos a largo plazo. Evita subidas salariales (P4) si este KPI es un problema, ya que impactan directamente en este ratio."
  },
  {
    key: 'nma',
    title: 'Nota Media Alumnado',
    currentValue: 7.5,
    targetValue: 8.5,
    min: 5,
    max: 10,
    step: 0.1,
    format: (v: number) => v.toFixed(1),
    advice: "La 'Formación docente' (P1) o la 'Inversión en TIC' (R2) son acciones directas para mejorar la calidad de la enseñanza y, por tanto, las notas. Alumnos con mejores notas mejoran la reputación y atraen más matrículas."
  },
  {
    key: 'marketShare',
    title: 'Cuota de mercado',
    currentValue: 12.5,
    targetValue: 15,
    min: 10,
    max: 25,
    step: 0.5,
    format: (v: number) => `${v.toFixed(1)}%`,
    advice: "Una 'Campaña publicitaria en redes' (R1) es la forma más directa de aumentar tu visibilidad y captar nuevos alumnos. Esto es crucial para crecer, ya que compites con otros centros por un número limitado de estudiantes."
  },
  {
    key: 'morale',
    title: 'Moral del personal',
    currentValue: 80,
    targetValue: 90,
    min: 50,
    max: 100,
    step: 5,
    format: (v: number) => `${v}%`,
    advice: "La moral alta reduce el riesgo de huelgas. La 'Formación docente' (P1) o los 'Beneficios no monetarios' (P5) son formas efectivas de motivar al equipo. Un equipo contento es más productivo y ofrece una mejor educación."
  },
  {
    key: 'studentTeacherRatio',
    title: 'Ratio Alumnos/Profesor',
    currentValue: 25.0,
    targetValue: 23.0,
    min: 20,
    max: 30,
    step: 0.5,
    format: (v: number) => v.toFixed(1),
    advice: "Para reducir este ratio, la única vía es la 'Contratación docente' (P2). Un ratio más bajo suele correlacionarse con una mejor atención al alumno y una NMA más alta, lo que a su vez mejora la reputación del centro."
  },
];

export default function StrategicPlanPage() {
  const [targets, setTargets] = useState(() =>
    kpis.reduce((acc, kpi) => ({ ...acc, [kpi.key]: kpi.targetValue }), {})
  );
  const [planConfirmed, setPlanConfirmed] = useState(false);

  const handleTargetChange = (key: string, value: number) => {
    setTargets(prev => ({ ...prev, [key]: value }));
  };
  
  const handleConfirmPlan = () => {
    // Here you would typically save the plan to your backend
    setPlanConfirmed(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Plan Estratégico (Ronda 0)
        </h1>
        <p className="text-muted-foreground">
          Define tus objetivos para la simulación. Una vez confirmados, no podrás cambiarlos.
        </p>
      </div>

       {planConfirmed && (
        <Alert variant="default" className="bg-emerald-50 border-emerald-200">
           <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
          <AlertTitle className="text-emerald-800">Plan Estratégico Confirmado</AlertTitle>
          <AlertDescription className="text-emerald-700">
            Tus objetivos han sido guardados. Ahora puedes comparar tu progreso en cada ronda.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map(kpi => (
          <Card key={kpi.key} className={planConfirmed ? "opacity-70" : ""}>
            <CardHeader>
              <CardTitle>{kpi.title}</CardTitle>
              <CardDescription>Define tu objetivo para este KPI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual: <span className="font-bold text-foreground">{kpi.format(kpi.currentValue)}</span></span>
                  <span className="font-bold">Objetivo: <span className="text-primary">{kpi.format(targets[kpi.key as keyof typeof targets])}</span></span>
                </div>
                <Slider
                  value={[targets[kpi.key as keyof typeof targets]]}
                  onValueChange={(value) => handleTargetChange(kpi.key, value[0])}
                  min={kpi.min}
                  max={kpi.max}
                  step={kpi.step}
                  disabled={planConfirmed}
                />
              </div>
              <Alert variant="default" className="bg-accent/20 border-accent/30 text-accent-foreground">
                <Lightbulb className="h-4 w-4 !text-amber-500" />
                <AlertTitle className="text-amber-700">Consejo IA</AlertTitle>
                <AlertDescription className="text-amber-900/80">
                  {kpi.advice}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ))}
      </div>

      {!planConfirmed && (
         <Card>
            <CardHeader>
                <CardTitle>Confirmar Plan</CardTitle>
                <CardDescription>
                    ¿Estás seguro de que quieres guardar estos objetivos? Esta acción es irreversible y definirá tu estrategia para el resto de la partida.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button size="lg" onClick={handleConfirmPlan}>Confirmar Plan Estratégico</Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
