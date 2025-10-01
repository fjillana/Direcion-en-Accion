
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
      <div className="grid gap-6 lg:grid-cols-2">
        <CrisisForm />
      </div>
    </div>
  );
}
