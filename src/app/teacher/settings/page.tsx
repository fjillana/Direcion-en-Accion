

"use client";

import { useState, useEffect, useMemo } from "react";
import { useGame } from "@/hooks/use-game-context";
import { useGames, type JoinRequest } from "@/hooks/use-games";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";


export default function SettingsPage() {
  const { activeGame } = useGame();
  const { updateGame, acceptJoinRequests } = useGames();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [aiDifficulty, setAiDifficulty] = useState(3);
  
  const [isRequestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<JoinRequest[]>([]);
  
  const pendingTeams = useMemo(() => {
    return activeGame?.pendingJoinRequests || [];
  }, [activeGame]);
  
  const acceptedTeams = useMemo(() => {
      return activeGame?.teamNames || [];
  }, [activeGame])

  useEffect(() => {
    if (activeGame) {
      setAiDifficulty(activeGame.aiDifficulty || 3);
    }
  }, [activeGame]);

  
  const teamsWithRivals = useMemo(() => {
      if (!activeGame) return [];
      const humanTeams = activeGame.teamNames.map(name => ({name, type: 'H'}));
      // Create one AI rival per human team
      const rivalTeams = Array.from({length: humanTeams.length}, (_, i) => ({name: `IA Rival ${i + 1}`, type: 'IA'}));
      return [...humanTeams, ...rivalTeams];
  }, [activeGame]);

  const handleDifficultyChange = (value: number[]) => {
    setAiDifficulty(value[0]);
  };

  const handleSaveChanges = () => {
    if (activeGame) {
      updateGame(activeGame.id, { 
        aiDifficulty,
      });
      toast({
        title: "Ajustes guardados",
        description: `Los ajustes para "${activeGame.name}" han sido actualizados.`,
      });
    }
  };

  const handleAcceptRequests = async () => {
    if (!activeGame || selectedRequests.length === 0) return;
    
    await acceptJoinRequests(activeGame.id, selectedRequests);

    toast({
        title: "Solicitudes Aceptadas",
        description: `${selectedRequests.length} equipo(s) han sido añadidos a la partida.`
    });

    setSelectedRequests([]);
    setRequestsDialogOpen(false);
  };
  
  const handleRemoveTeam = async (teamNameToRemove: string) => {
    if (!activeGame || !firestore) return;
    
    // This part requires finding the student ID associated with the team name
    // This is a simplification. A real app might need a more robust way to do this.
    // For now, we assume this logic is handled elsewhere or is not needed for this UI action.
    
    // Update teamNames array in the game
    const updatedAcceptedTeams = acceptedTeams.filter(name => name !== teamNameToRemove);
    await updateGame(activeGame.id, { teamNames: updatedAcceptedTeams });
    
    // A full implementation would also reset the student's state in `/studentGames/{userId}`
  };

  const handleRequestCheckboxChange = (request: JoinRequest, checked: boolean) => {
    if (!activeGame) return;
    setSelectedRequests(prev =>
      checked ? [...prev, request] : prev.filter(r => r.userId !== request.userId)
    );
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Ajustes</h1>

      {activeGame ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ajustes de la Partida: {activeGame.name}</CardTitle>
              <CardDescription>
                Estos ajustes se aplicarán a la partida que tienes activa.
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

          <Card className="lg:col-span-2">
             <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Gestión de Participantes</CardTitle>
                        <CardDescription>Acepta solicitudes y gestiona los equipos de la partida.</CardDescription>
                    </div>
                    <Dialog open={isRequestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
                      <DialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={acceptedTeams.length >= activeGame.teams}>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Gestionar Solicitudes ({pendingTeams.length})
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Solicitudes Pendientes</DialogTitle>
                              <DialogDescription>
                                  Selecciona los equipos que quieres aceptar en la partida.
                              </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-64">
                              <div className="space-y-4 p-4">
                                  {pendingTeams.map((team) => (
                                      <div key={team.userId} className="flex items-center space-x-3">
                                          <Checkbox 
                                              id={`req-${team.userId}`} 
                                              onCheckedChange={(checked) => handleRequestCheckboxChange(team, !!checked)}
                                              checked={selectedRequests.some(r => r.userId === team.userId)}
                                              disabled={acceptedTeams.length + selectedRequests.length >= activeGame.teams && !selectedRequests.some(r => r.userId === team.userId)}
                                          />
                                          <Label htmlFor={`req-${team.userId}`} className="font-medium cursor-pointer">{team.teamName}</Label>
                                      </div>
                                  ))}
                                  {pendingTeams.length === 0 && <p className="text-center text-sm text-muted-foreground">No hay solicitudes pendientes.</p>}
                              </div>
                          </ScrollArea>
                          <DialogFooter>
                              <Button variant="outline" onClick={() => setRequestsDialogOpen(false)}>Cancelar</Button>
                              <Button onClick={handleAcceptRequests} disabled={selectedRequests.length === 0}>Aceptar Seleccionados</Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
              <h4 className="mb-2 font-medium">Equipos en la Partida</h4>
              <div className="rounded-lg border">
                <ScrollArea className="h-64">
                    {teamsWithRivals.length > 0 ? (
                        teamsWithRivals.map((team, index) => (
                            <div key={`${team.name}-${index}`} className={cn("flex items-center justify-between p-3", index < teamsWithRivals.length - 1 && "border-b")}>
                                <div className="flex items-center gap-2">
                                   {team.type === 'H' ? <User className="h-4 w-4 text-muted-foreground" /> : <Bot className="h-4 w-4 text-muted-foreground" />}
                                    <span className={cn(team.type === 'IA' && 'text-muted-foreground')}>{team.name}</span>
                                </div>
                                {team.type === 'H' && (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro de que quieres eliminar a {team.name}?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer fácilmente. El equipo será eliminado de la partida y tendrá que ser aceptado de nuevo.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemoveTeam(team.name)}>
                                                Sí, eliminar equipo
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        ))
                    ) : (
                         <div className="flex items-center justify-center h-full p-10">
                            <p className="text-sm text-muted-foreground">Aún no hay equipos en la partida.</p>
                         </div>
                    )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

        </div>
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
