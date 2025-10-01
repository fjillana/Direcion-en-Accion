
"use client";

import { InvestmentForm } from "@/components/student/investment-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { useState } from "react"; // Assuming you have a way to get this state
import { StudentGate } from "@/components/student/student-gate";

export default function DecisionsPage() {
  // This state would likely come from a shared context or parent component
  // For now, we simulate it here. You'd need to lift this state up.
  const [roundConfirmed, setRoundConfirmed] = useState(false);

  return (
    <StudentGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Decisiones de Inversión
          </h1>
          <p className="text-muted-foreground">
            Asigna los fondos de tu equipo para esta ronda. Las decisiones se pueden revertir hasta que confirmes la ronda en el Dashboard.
          </p>
        </div>

        {roundConfirmed && (
          <Alert variant="default" className="bg-muted/50">
            <Lock className="h-4 w-4" />
            <AlertTitle>Ronda Finalizada</AlertTitle>
            <AlertDescription>
              Ya has confirmado tus decisiones para esta ronda. No puedes realizar más cambios.
            </AlertDescription>
          </Alert>
        )}

        <InvestmentForm disabled={roundConfirmed} />
      </div>
    </StudentGate>
  );
}
