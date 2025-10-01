
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
import { PlusCircle, User, Bot, UserCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

const allPendingTeams = [
    { id: 'team-epsilon', name: 'Equipo Epsilon' },
    { id: 'team-zeta', name: 'Equipo Zeta' },
    { id: 'team-theta', name: 'Equipo Theta' },
];

export default function ConfigPage() {
  const { games, updateGame } = useGames();
  const { activeGame, setActiveGameId } = useGame();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(activeGame?.id || null);
  const [aiDifficulty, setAiDifficulty] = useState(3);
  
  const [acceptedTeams, setAcceptedTeams] = useState<string[]>([]);
  const [pendingTeams, setPendingTeams] = useState(allPendingTeams);

  const [isRequestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<string[]>([]);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (activeGame) {
      setSelectedGameId(activeGame.id);
      setAcceptedTeams(activeGame.teams || []);
      // Filter pending teams to not include already accepted ones
      setPendingTeams(allPendingTeams.filter(pt => !(activeGame.teams || []).includes(pt.name)));
    } else {
      setAcceptedTeams([]);
    }
  }, [activeGame]);
  
  const handleGameSelect = (gameId: string) => {
    setActiveGameId(gameId);
    setSelectedGameId(gameId);
    const game = games.find(g => g.id === gameId);
    if (game) {
      setAcceptedTeams(game.teams || []);
      setPendingTeams(allPendingTeams.filter(pt => !(game.teams || []).includes(pt.name)));
    }
  }
  
  const handleSaveChanges = () => {
    if (selectedGameId) {
      updateGame(selectedGameId, { teams: acceptedTeams });
      toast({
        title: "Cambios guardados",
        description: "La configuración del juego ha sido actualizada.",
      });
    }
  }

  const handleAcceptTeams = () => {
    const newAcceptedTeams = selectedPending.map(id => pendingTeams.find(t => t.id === id)!.name);
    setAcceptedTeams(prev => [...prev, ...newAcceptedTeams]);
    setPendingTeams(prev => prev.filter(t => !selectedPending.includes(t.id)));
    setSelectedPending([]);
    setRequestsDialogOpen(false);
  }

  const handlePendingSelection = (teamId: string, checked: boolean) => {
    setSelectedPending(prev => 
        checked ? [...prev, teamId] : prev.filter(id => id !== teamId)
    );
  }
  
  const handleRemoveTeam = (teamNameToRemove: string) => {
    setAcceptedTeams(prev => prev.filter(name => name !== teamNameToRemove));
    // Optional: add team back to pending list
    const teamObject = allPendingTeams.find(t => t.name === teamNameToRemove);
    if (teamObject && !pendingTeams.some(pt => pt.id === teamObject.id)) {
        setPendingTeams(prev => [...prev, teamObject].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };


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

  return (
    <>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Equipos en la Partida</CardTitle>
                      <CardDescription>
                          Acepta equipos para que participen. Por cada equipo humano, se añadirá un rival IA. Actualmente hay {acceptedTeams.length} equipos humanos y {acceptedTeams.length} rivales IA.
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setRequestsDialogOpen(true)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Gestionar Solicitudes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {acceptedTeams.map((teamName, index) => (
                            <div key={`human-${index}`} className="relative group p-4 border rounded-lg flex flex-col items-center gap-2">
                                <User className="w-8 h-8"/>
                                <span className="font-semibold">{teamName}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Seguro que quieres eliminar a {teamName}?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. El equipo será eliminado de la partida y tendrá que solicitar unirse de nuevo.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemoveTeam(teamName)}>
                                                Sí, eliminar equipo
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                        {acceptedTeams.map((_, index) => (
                             <div key={`ai-${index}`} className="p-4 border rounded-lg flex flex-col items-center gap-2 bg-muted/50">
                                <Bot className="w-8 h-8 text-muted-foreground"/>
                                <span className="font-semibold text-muted-foreground">Rival IA {index + 1}</span>
                            </div>
                        ))}
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

    <Dialog open={isRequestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Gestionar Solicitudes de Unión</DialogTitle>
                <DialogDescription>
                    Selecciona los equipos que quieres aceptar en esta partida.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
                {pendingTeams.length > 0 ? pendingTeams.map(team => (
                    <div key={team.id} className="flex items-center space-x-3 p-3 rounded-md border hover:bg-muted/50">
                         <Checkbox 
                            id={team.id}
                            onCheckedChange={(checked) => handlePendingSelection(team.id, !!checked)}
                            checked={selectedPending.includes(team.id)}
                        />
                        <Label htmlFor={team.id} className="font-medium cursor-pointer">
                            {team.name}
                        </Label>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay nuevas solicitudes de equipos.</p>
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setRequestsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAcceptTeams} disabled={selectedPending.length === 0}>
                    Aceptar Seleccionados
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
