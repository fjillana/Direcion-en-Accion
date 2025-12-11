
"use client";

import { useState, useEffect } from "react";
import { useStudentGame } from "@/hooks/useStudentGame";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import type { Game } from "@/hooks/use-games";


export default function JoinGamePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { studentGame, requestToJoinGame, isLoading: studentGameLoading } = useStudentGame();
  
  const firestore = useFirestore();
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    if(!firestore || !user) {
        setGamesLoading(false);
        return;
    }

    setGamesLoading(true);
    const q = query(collection(firestore, "games"), where("status", "==", "En curso"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
        setAvailableGames(gamesData);
        setGamesLoading(false);
    }, (err) => {
        console.error("Failed to fetch available games:", err);
        setError("No se pudieron cargar las partidas. Es posible que no tengas permisos o que no haya partidas disponibles.");
        setGamesLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user]);


  const isLoading = gamesLoading || studentGameLoading || isAuthLoading;

  useEffect(() => {
    // If the student is already in a game or pending, they should not be on this page.
    if (!isLoading && studentGame?.status && ['joined', 'pending'].includes(studentGame.status)) {
      router.push('/student/dashboard');
    }
  }, [studentGame, isLoading, router]);

  useEffect(() => {
    if (!isLoading && availableGames && availableGames.length === 1) {
      setSelectedGameId(availableGames[0].id);
    }
  }, [availableGames, isLoading]);

  const handleJoinRequest = () => {
    if (!selectedGameId) {
      setError("Por favor, selecciona una partida.");
      return;
    }
    if (!teamName.trim()) {
      setError("Por favor, introduce un nombre para tu equipo.");
      return;
    }
    const selectedGame = availableGames.find(g => g.id === selectedGameId);
    if (selectedGame) {
        requestToJoinGame(selectedGameId, selectedGame.name, teamName);
        // The redirection will be handled by the effect once the state updates to 'pending'
    }
  };

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
                    <span className="ml-2">Cargando partidas...</span>
                </div>
              ) : availableGames && availableGames.length > 0 ? (
                availableGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedGameId === game.id ? 'bg-primary text-primary-foreground shadow' : 'bg-muted/50 hover:bg-muted'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{game.name}</span>
                      <Badge variant={selectedGameId === game.id ? 'secondary' : 'outline'}>
                        {game.teamNames?.length || 0} / {game.teams} equipos
                      </Badge>
                    </div>
                    <p className="text-sm mt-1">Rondas: {game.numRounds}</p>
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-full py-4">
                    <p className="text-center text-sm text-muted-foreground">{error || 'No hay partidas disponibles en este momento.'}</p>
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

          {error && !availableGames.length ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ): null}

        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleJoinRequest}
            disabled={!selectedGameId || !teamName || isLoading}
          >
            {studentGameLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Solicitar Unirse a la Partida
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
