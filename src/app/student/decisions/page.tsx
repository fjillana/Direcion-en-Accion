"use client";

import { InvestmentForm } from "@/components/student/investment-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";

export default function DecisionsPage() {
  const { studentGame, setRoundDecisions } = useStudentGame();
  const { getGameById } = useGames();

  const gameData = studentGame?.gameId ? getGameById(studentGame.gameId) : null;
  const initialFunds = gameData?.initialFunds || 0;

  const availableInvestments = studentGame?.roundSettings?.investments || [];
  const selectedInvestments = studentGame?.decisions?.selectedInvestments || [];
  
  // Aseguramos que selectedCenterActions es siempre un array para evitar errores de ejecución.
  const selectedCenterActions = Array.isArray(studentGame?.decisions?.selectedCenterActions) 
    ? studentGame.decisions.selectedCenterActions 
    : [];

  const roundConfirmed = studentGame?.decisions?.roundConfirmed || false;
  // En Ronda 0, el cash disponible para planificar es el inicial. En rondas posteriores, es el del KPI.
  const teamCash = studentGame?.round === 0 ? initialFunds : studentGame?.kpis?.cash || 0;


  const centerActionsCosts = {
    'P2': 7500, // Contratar Docente
    'P7': 7500, // Despedir Docente
    'F5': 50000, // Ampliación de Aulas
  };

  const centerActionTotalCost = selectedCenterActions.reduce((acc, id) => {
    return acc + (centerActionsCosts[id as keyof typeof centerActionsCosts] || 0);
  }, 0);

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

        <InvestmentForm 
          disabled={roundConfirmed}
          availableInvestments={availableInvestments}
          selectedInvestments={selectedInvestments}
          onInvestmentChange={(investments) => setRoundDecisions({ selectedInvestments: investments })}
          totalOtherCosts={centerActionTotalCost}
          teamCash={teamCash}
        />
      </div>
    </StudentGate>
  );
}
