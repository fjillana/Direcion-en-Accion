
"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/hooks/use-game-context";
import { useGames } from "@/hooks/use-games";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { activeGame } = useGame();
  const { updateGame } = useGames();
  const { toast } = useToast();

  const [aiDifficulty, setAiDifficulty] = useState(3);

  useEffect(() => {
    if (activeGame) {
      setAiDifficulty(activeGame.aiDifficulty);
    }
  }, [activeGame]);

  const handleDifficultyChange = (value: number[]) => {
    setAiDifficulty(value[0]);
  };

  const handleSaveChanges = () => {
    if (activeGame) {
      updateGame(activeGame.id, { aiDifficulty });
      toast({
        title: "Ajustes guardados",
        description: `La dificultad de la IA para "${activeGame.name}" ha sido actualizada.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Ajustes</h1>

      {activeGame ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Ajustes de la Partida: {activeGame.name}</CardTitle>
            <CardDescription>
              Estos ajustes se aplicarán a la partida que tienes activa actualmente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="ai-difficulty">
                Dificultad de Rivales IA ({aiDifficulty})
              </Label>
              <Slider
                id="ai-difficulty"
                min={1}
                max={5}
                step={1}
                value={[aiDifficulty]}
                onValueChange={handleDifficultyChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No hay ninguna partida activa</CardTitle>
            <CardDescription>
              Por favor, selecciona una partida desde tu dashboard para poder
              configurar sus ajustes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/teacher/dashboard">Ir al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
