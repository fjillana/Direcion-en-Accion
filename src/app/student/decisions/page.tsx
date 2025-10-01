
import { InvestmentForm } from "@/components/student/investment-form";

export default function DecisionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Inversiones de la Ronda 3
        </h1>
        <p className="text-muted-foreground">
          Asigna los fondos de tu equipo para esta ronda. Las decisiones se pueden revertir hasta que confirmes la ronda en el Dashboard.
        </p>
      </div>
      <InvestmentForm />
    </div>
  );
}
