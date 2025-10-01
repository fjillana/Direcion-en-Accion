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
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { StudentGate } from '@/components/student/student-gate';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStudentGame } from '@/hooks/useStudentGame';

const kpiDefinitions = [
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

  const handleTargetChange = (key: string, value: number) => {
    setStrategicPlan({
        ...strategicPlan,
        targets: {
            ...strategicPlan?.targets,
            [key]: { ...strategicPlan?.targets?.[key], target: value }
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
          {kpiDefinitions.map(kpi => {
            const currentTarget = strategicPlan?.targets?.[kpi.key as keyof typeof strategicPlan.targets];
            return (
                <Card key={kpi.key} className={planConfirmed ? "opacity-70" : ""}>
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
            );
        })}
        </div>

        <Card className={planConfirmed ? "opacity-70" : ""}>
            <CardHeader>
                <CardTitle>Metas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="ranking-goal">Ranking Objetivo</Label>
                    <Input 
                        id="ranking-goal"
                        placeholder="Ej: Top 3, No ser el último..."
                        value={strategicPlan?.rankingGoal || ''}
                        onChange={(e) => handleRankingChange(e.target.value)}
                        disabled={planConfirmed}
                    />
                </div>
            </CardContent>
        </Card>

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
    </StudentGate>
  );
}
