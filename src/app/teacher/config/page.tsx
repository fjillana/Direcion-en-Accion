
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useGame } from "@/hooks/use-game-context";
import { useGames } from "@/hooks/use-games";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ConfigPage() {
  const { games, updateGame } = useGames();
  const { activeGame, setActiveGameId } = useGame();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(activeGame?.id || null);
  const [aiDifficulty, setAiDifficulty] = useState(3);
  const [numTeams, setNumTeams] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (activeGame) {
      setSelectedGameId(activeGame.id);
      setNumTeams(activeGame.teams);
    }
  }, [activeGame]);
  
  const handleGameSelect = (gameId: string) => {
    setActiveGameId(gameId);
    setSelectedGameId(gameId);
    const game = games.find(g => g.id === gameId);
    if(game) {
      setNumTeams(game.teams);
    }
  }
  
  const handleAddTeam = () => {
    setNumTeams(prev => prev + 1);
  }
  
  const handleSaveChanges = () => {
    if (selectedGameId) {
      updateGame(selectedGameId, { teams: numTeams });
      toast({
        title: "Cambios guardados",
        description: "La configuración del juego ha sido actualizada.",
      });
    }
  }

  if (games.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
                  <p className="text-muted-foreground">No hay partidas disponibles para configurar.</p>
                  <Button onClick={() => router.push('/teacher/dashboard')}>Crear una Partida</Button>
              </CardContent>
          </Card>
      );
  }

  const selectedGame = games.find(g => g.id === selectedGameId);
  const totalTeams = numTeams * 2; // 1 human + 1 AI per numTeams

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Configuración de la Partida</h1>
            <p className="text-muted-foreground">
                Ajusta los parámetros de la partida en curso.
            </p>
          </div>
          {games.length > 0 && (
             <Select onValueChange={handleGameSelect} value={selectedGameId || ""}>
                <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Selecciona una partida" />
                </SelectTrigger>
                <SelectContent>
                    {games.map(game => (
                        <SelectItem key={game.id} value={game.id}>
                            {game.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          )}
      </div>

      {!selectedGame ? (
         <Alert>
          <AlertTitle>No hay ninguna partida seleccionada</AlertTitle>
          <AlertDescription>Por favor, selecciona una partida de la lista para ver y editar su configuración.</AlertDescription>
        </Alert>
      ) : (
        <>
            <Card>
                <CardHeader>
                <CardTitle>Equipos en la Partida</CardTitle>
                <CardDescription>
                    Añade nuevos equipos humanos. Por cada equipo humano, se añadirá un rival IA. Actualmente hay {numTeams} equipos humanos y {numTeams} rivales IA.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: numTeams }).map((_, index) => (
                            <div key={`human-${index}`} className="p-4 border rounded-lg flex flex-col items-center gap-2">
                                <User className="w-8 h-8"/>
                                <span className="font-semibold">Equipo Humano {index + 1}</span>
                            </div>
                        ))}
                        {Array.from({ length: numTeams }).map((_, index) => (
                             <div key={`ai-${index}`} className="p-4 border rounded-lg flex flex-col items-center gap-2 bg-muted/50">
                                <Bot className="w-8 h-8 text-muted-foreground"/>
                                <span className="font-semibold text-muted-foreground">Rival IA {index + 1}</span>
                            </div>
                        ))}
                         <Button variant="outline" className="h-full min-h-[100px] border-dashed" onClick={handleAddTeam}>
                            <PlusCircle className="w-6 h-6 mr-2"/>
                            Añadir Equipo
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Parámetros Generales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Dificultad de Rivales IA ({aiDifficulty})</Label>
                    <Slider
                    value={[aiDifficulty]}
                    onValueChange={(value) => setAiDifficulty(value[0])}
                    min={1}
                    max={5}
                    step={1}
                    />
                </div>
                </CardContent>
            </Card>
             <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveChanges}>Guardar Cambios</Button>
            </div>
        </>
      )}
    </div>
  );
}
