
"use client";

import { InvestmentForm } from "@/components/student/investment-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2 } from "lucide-react";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { investments as allInvestments } from "@/app/teacher/catalog/investment-data";

export default function DecisionsPage() {
  const { studentGame, setRoundDecisions, saveStudentDecisions } = useStudentGame();
  const { getGameById } = useGames();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const gameData = studentGame?.gameId ? getGameById(studentGame.gameId) : null;
  const initialFunds = gameData?.initialFunds || 0;

  const availableInvestments = useMemo(() => {
    const roundSettings = studentGame?.roundSettings;
    const currentRound = studentGame?.round;

    if (!roundSettings || currentRound === undefined) return [];
    
    // The settings might not be defined for the current round yet
    const settingsForRound = roundSettings[currentRound];
    if (!settingsForRound) return [];

    return settingsForRound.investments.map(inv => {
      // Find the full investment data from the catalog
      return allInvestments.find(invData => invData.id === inv.id);
    }).filter(Boolean) as typeof allInvestments;

  }, [studentGame?.round, studentGame?.roundSettings]);

  const selectedActions = studentGame?.decisions?.actions || [];
  
  const roundConfirmed = studentGame?.decisions?.roundConfirmed || false;
  const teamCash = studentGame?.round === 0 ? initialFunds : studentGame?.kpis?.cash || 0;


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

  const handleActionChange = (actionId: string, selected: boolean) => {
    const currentActions = studentGame?.decisions?.actions || [];
    const newActions = selected 
      ? [...currentActions, actionId]
      : currentActions.filter(id => id !== actionId);
    setRoundDecisions({ actions: newActions });
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
          selectedActions={selectedActions}
          onActionChange={handleActionChange}
          onSave={handleSave}
          isSaving={isSaving}
          teamCash={teamCash}
        />
      </div>
    </StudentGate>
  );
}
