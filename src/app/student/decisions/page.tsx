import { DecisionForm } from "@/components/student/decision-form";

export default function DecisionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Decisiones de la Ronda 3
        </h1>
        <p className="text-muted-foreground">
          Asigna los recursos de tu equipo para esta ronda.
        </p>
      </div>
      <DecisionForm />
    </div>
  );
}
