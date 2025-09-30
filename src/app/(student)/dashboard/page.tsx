import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/components/student/kpi-card";
import { CrisisForm } from "@/components/student/crisis-form";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Resumen del Equipo Beta
        </h1>
        <p className="text-muted-foreground">
          Ronda 3 - ¡Tus decisiones marcarán la diferencia!
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Fondos" value="$85,320" trend="up" change="+5.2%" />
        <KpiCard
          title="Reputación"
          value="78"
          trend="down"
          change="-2.1%"
        />
        <KpiCard title="PEB" value="105%" trend="up" change="+3%" />
        <KpiCard
          title="Experiencia (XP)"
          value="1500"
          trend="up"
          change="+250"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Briefing de la Ronda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              El mercado está experimentando un crecimiento inesperado en el
              sector tecnológico. Los consumidores demandan productos más
              innovadores y están dispuestos a pagar un extra por la calidad.
              Sin embargo, los costos de las materias primas también han
              aumentado, lo que presiona los márgenes de beneficio.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Vuestra tarea es capitalizar el auge del mercado sin comprometer
              la salud financiera de la empresa. ¡Buena suerte!
            </p>
          </CardContent>
        </Card>
        <CrisisForm />
      </div>
    </div>
  );
}
