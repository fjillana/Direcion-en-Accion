
"use client";

import { useState } from "react";
import { useGames } from "@/hooks/use-games";
import { useStudentGame } from "@/hooks/useStudentGame";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JoinGamePage() {
  const { games, loading: gamesLoading } = useGames();
  const { requestToJoinGame, isLoading: studentGameLoading } = useStudentGame();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoinRequest = () => {
    if (!selectedGameId) {
      setError("Por favor, selecciona una partida.");
      return;
    }
    if (!teamName.trim()) {
      setError("Por favor, introduce un nombre para tu equipo.");
      return;
    }
    const selectedGame = games.find(g => g.id === selectedGameId);
    if (selectedGame) {
        requestToJoinGame(selectedGameId, selectedGame.name, teamName);
        router.push('/student/dashboard');
    }
  };
  
  const isLoading = gamesLoading || studentGameLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Unirse a una Partida</CardTitle>
          <CardDescription>
            Selecciona una de las partidas disponibles e introduce el nombre de tu equipo para solicitar unirte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Partidas Disponibles</h3>
            <div className="space-y-3 rounded-lg border p-3 min-h-[150px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : games.length > 0 ? games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${selectedGameId === game.id ? 'bg-primary text-primary-foreground shadow' : 'bg-muted/50 hover:bg-muted'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{game.name}</span>
                    <Badge variant={selectedGameId === game.id ? 'secondary' : 'outline'}>
                      {game.teamNames.length} / {game.teams} equipos
                    </Badge>
                  </div>
                  <p className="text-sm mt-1">Rondas: {game.numRounds}</p>
                </button>
              )) : (
                <div className="flex items-center justify-center h-full py-4">
                    <p className="text-center text-sm text-muted-foreground">No hay partidas disponibles en este momento.</p>
                </div>
              )}
            </div>
          </div>
          
          {selectedGameId && (
            <div className="space-y-2">
              <Label htmlFor="team-name">Nombre de tu Equipo</Label>
              <Input 
                id="team-name" 
                placeholder="Ej: Equipo Beta" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleJoinRequest}
            disabled={!selectedGameId || !teamName || isLoading}
          >
            Solicitar Unirse a la Partida
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
