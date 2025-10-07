"use client";

import { InvestmentForm } from "@/components/student/investment-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2 } from "lucide-react";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function DecisionsPage() {
  const { studentGame, setRoundDecisions, saveStudentDecisions } = useStudentGame();
  const { getGameById } = useGames();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const gameData = studentGame?.gameId ? getGameById(studentGame.gameId) : null;
  const initialFunds = gameData?.initialFunds || 0;

  const availableInvestments = studentGame?.roundSettings?.investments || [];
  const selectedInvestments = studentGame?.decisions?.selectedInvestments || [];
  
  const selectedCenterActions = Array.isArray(studentGame?.decisions?.selectedCenterActions) 
    ? studentGame.decisions.selectedCenterActions 
    : [];

  const roundConfirmed = studentGame?.decisions?.roundConfirmed || false;
  const teamCash = studentGame?.round === 0 ? initialFunds : studentGame?.kpis?.cash || 0;


  const centerActionsCosts = {
    'P2': 7500, // Contratar Docente
    'P7': 7500, // Despedir Docente
    'F5': 50000, // Ampliación de Aulas
  };

  const centerActionTotalCost = selectedCenterActions.reduce((acc, id) => {
    return acc + (centerActionsCosts[id as keyof typeof centerActionsCosts] || 0);
  }, 0);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await saveStudentDecisions();
        toast({
            title: "Decisiones Guardadas",
            description: "Tus decisiones de inversión han sido guardadas. Recuerda confirmar la ronda en el Dashboard.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al guardar",
            description: "No se pudieron guardar tus decisiones. Inténtalo de nuevo.",
        });
    } finally {
        setIsSaving(false);
    }
  };

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
          onSave={handleSave}
          isSaving={isSaving}
          totalOtherCosts={centerActionTotalCost}
          teamCash={teamCash}
        />
      </div>
    </StudentGate>
  );
}
