"use client";

import { InvestmentForm } from "@/components/student/investment-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2 } from "lucide-react";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { investments } from "@/app/teacher/catalog/investment-data";

export default function DecisionsPage() {
  const { studentGame, setRoundDecisions, saveStudentDecisions } = useStudentGame();
  const { getGameById } = useGames();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const gameData = studentGame?.gameId ? getGameById(studentGame.gameId) : null;
  const initialFunds = gameData?.initialFunds || 0;

  const availableInvestments = studentGame?.roundSettings?.investments || [];
  const selectedActions = studentGame?.decisions?.actions || [];
  
  const roundConfirmed = studentGame?.decisions?.roundConfirmed || false;
  const teamCash = studentGame?.round === 0 ? initialFunds : studentGame?.kpis?.cash || 0;


  const allActionsWithCosts = useMemo(() => {
    const actionCosts: Record<string, number> = {
      'P2': 7500, // Contratar Docente
      'P7': 7500, // Despedir Docente
      'F5': 50000, // Ampliación de Aulas
    };
    investments.forEach(inv => {
        if (inv.cost.type === 'fixed') {
            actionCosts[inv.id] = inv.cost.value as number;
        } else {
            // For range, we need the user's selected cost, which is not available here.
            // This will be handled inside the InvestmentForm.
            // For now, we can use a default or max value for estimation if needed, but the form handles the true cost.
        }
    });
    return actionCosts;
  }, []);

  const totalCost = useMemo(() => {
    return selectedActions.reduce((acc, id) => {
      const investment = investments.find(inv => inv.id === id);
      if (investment && investment.cost.type === 'range') {
        // Since we unified decisions, we need a way to store the selected cost.
        // For now, this logic is simplified. A better approach would be to store cost with the action.
        // Let's assume the form handles the actual cost calculation.
        // This total cost is now primarily a display concern on this page.
      }
      return acc + (allActionsWithCosts[id] || 0);
    }, 0);
  }, [selectedActions, allActionsWithCosts]);


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
