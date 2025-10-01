"use client";

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
import { CheckCircle2, Lightbulb, Info } from 'lucide-react';
import { StudentGate } from '@/components/student/student-gate';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStudentGame } from '@/hooks/useStudentGame';

const kpiDefinitions = [
  {
    key: 'cash',
    title: 'Saldo de Tesorería',
    currentValue: 50000,
    min: 0,
    max: 100000,
    step: 5000,
    format: (v: number) => `${v.toLocaleString('es-ES')} CC`,
    advice: "Mantener una tesorería saludable te da flexibilidad. Evita caer por debajo del 5% de tus ingresos anuales para no sufrir penalizaciones en el PEB de finanzas."
  },
  {
    key: 'personnelCost',
    title: 'Coste de Personal / Ingresos',
    currentValue: 75,
    min: 65,
    max: 90,
    step: 1,
    format: (v: number) => `${v.toFixed(1)}%`,
    advice: "El umbral de riesgo está en el 75%. Superarlo afectará a tu PEB financiero. Contratar o subir salarios incrementa este ratio, pero puede mejorar la moral y la calidad."
  },
  {
    key: 'nma',
    title: 'Nota Media Alumnado',
    currentValue: 7.5,
    min: 5,
    max: 10,
    step: 0.1,
    format: (v: number) => v.toFixed(1),
    advice: "La 'Formación docente' (P1) o la 'Inversión en TIC' (R2) son acciones directas para mejorar la calidad de la enseñanza y, por tanto, las notas. Alumnos con mejores notas mejoran la reputación y atraen más matrículas."
  },
  {
    key: 'marketShare',
    title: 'Cuota de mercado',
    currentValue: 16.7,
    min: 10,
    max: 25,
    step: 0.1,
    format: (v: number) => `${v.toFixed(1)}%`,
    advice: "Una 'Campaña publicitaria en redes' (R1) es la forma más directa de aumentar tu visibilidad y captar nuevos alumnos. Esto es crucial para crecer, ya que compites con otros centros por un número limitado de estudiantes."
  },
  {
    key: 'morale',
    title: 'Moral del Personal',
    currentValue: 80,
    min: 50,
    max: 100,
    step: 5,
    format: (v: number) => `${v.toFixed(0)}%`,
    advice: "Una moral alta previene crisis como las huelgas. Inversiones en formación (P1), beneficios (P5) o mejoras salariales (P4) tienen un impacto directo en la satisfacción de tu equipo."
  },
  {
    key: 'studentTeacherRatio',
    title: 'Ratio Alumnos/Profesor',
    currentValue: 25.0,
    min: 20,
    max: 30,
    step: 0.5,
    format: (v: number) => v.toFixed(1),
    advice: "Para reducir este ratio, la única vía es la 'Contratación docente' (P2). Un ratio más bajo suele correlacionarse con una mejor atención al alumno y una NMA más alta, lo que a su vez mejora la reputación del centro."
  },
];

export default function StrategicPlanPage() {
  const { studentGame, setStrategicPlan } = useStudentGame();

  const planConfirmed = studentGame?.planConfirmed || false;
  const strategicPlan = studentGame?.strategicPlan;
  const isRoundZero = studentGame?.round === 0;

  const handleTargetChange = (key: string, value: number) => {
    setStrategicPlan({
        ...strategicPlan,
        targets: {
            ...strategicPlan?.targets,
            [key]: { ...strategicPlan?.targets?.[key as keyof typeof strategicPlan.targets], target: value }
        }
    });
  };

  const handleRankingChange = (value: string) => {
    setStrategicPlan({
        ...strategicPlan,
        rankingGoal: value
    });
  };
  
  const handleConfirmPlan = () => {
    setStrategicPlan({ ...strategicPlan, confirmed: true });
  };
  
  if (!isRoundZero || planConfirmed) {
    return (
        <StudentGate>
            <Alert variant="default" className="bg-emerald-50 border-emerald-200">
                <Info className="h-4 w-4 !text-emerald-600" />
                <AlertTitle className="text-emerald-800">Plan Estratégico Confirmado</AlertTitle>
                <AlertDescription className="text-emerald-700">
                    Tu plan estratégico se definió en la Ronda 0 y ya no se puede modificar. Puedes consultarlo aquí.
                </AlertDescription>
            </Alert>
            {/* Render read-only view */}
            <div className="space-y-6 mt-6">
                 <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {kpiDefinitions.map(kpi => {
                        const currentTarget = strategicPlan?.targets?.[kpi.key as keyof typeof strategicPlan.targets];
                        return (
                            <Card key={kpi.key} className="opacity-70">
                            <CardHeader>
                                <CardTitle>{kpi.title}</CardTitle>
                                <CardDescription>Este fue tu objetivo para la partida.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span>Objetivo: <span className="text-primary">{currentTarget ? kpi.format(currentTarget.target) : 'N/A'}</span></span>
                                    </div>
                                </div>
                            </CardContent>
                            </Card>
                        );
                    })}
                </div>
                 <Card className="opacity-70">
                    <CardHeader>
                        <CardTitle>Misión / Visión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground italic">"{strategicPlan?.rankingGoal || 'No definida'}"</p>
                    </CardContent>
                </Card>
            </div>
        </StudentGate>
    );
  }

  return (
    <StudentGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Plan Estratégico (Ronda 0)
          </h1>
          <p className="text-muted-foreground">
            Define tus objetivos para la simulación. Una vez confirmados, no podrás cambiarlos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {kpiDefinitions.map(kpi => {
            const currentTarget = strategicPlan?.targets?.[kpi.key as keyof typeof strategicPlan.targets];
            return (
                <Card key={kpi.key}>
                <CardHeader>
                    <CardTitle>{kpi.title}</CardTitle>
                    <CardDescription>Define tu objetivo para este KPI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Actual: <span className="font-bold text-foreground">{kpi.format(kpi.currentValue)}</span></span>
                        <span className="font-bold">Objetivo: <span className="text-primary">{kpi.format(currentTarget?.target || kpi.currentValue)}</span></span>
                    </div>
                    <Slider
                        value={[currentTarget?.target || kpi.currentValue]}
                        onValueChange={(value) => handleTargetChange(kpi.key, value[0])}
                        min={kpi.min}
                        max={kpi.max}
                        step={kpi.step}
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
            );
        })}
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Misión / Visión</CardTitle>
                <CardDescription>Describe en una frase la visión de tu centro o tu meta principal en el ranking.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="ranking-goal" className="sr-only">Misión / Visión</Label>
                    <Input 
                        id="ranking-goal"
                        placeholder="Ej: 'Ser el centro más prestigioso', 'Acabar en el Top 3', 'No ser el último'..."
                        value={strategicPlan?.rankingGoal || ''}
                        onChange={(e) => handleRankingChange(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Confirmar Plan</CardTitle>
                <CardDescription>
                    Al confirmar, tus objetivos estratégicos quedarán guardados. Esta acción es irreversible y definirá tu estrategia para el resto de la partida. Aún podrás modificar tus inversiones de la Ronda 0.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button size="lg" onClick={handleConfirmPlan}>Confirmar Plan Estratégico</Button>
            </CardFooter>
        </Card>
      </div>
    </StudentGate>
  );
}
