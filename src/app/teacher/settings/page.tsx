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
import { PlusCircle, Trash2, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";


export default function SettingsPage() {
  const { activeGame } = useGame();
  const { updateGame, acceptJoinRequests, removeTeamFromGame, loading: gamesLoading } = useGames();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [aiDifficulty, setAiDifficulty] = useState(3);
  
  const [isRequestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<JoinRequest[]>([]);
  const [isAccepting, setIsAccepting] = useState(false);
  
  const pendingTeams = useMemo(() => {
    return activeGame?.pendingJoinRequests || [];
  }, [activeGame]);
  
  const acceptedTeams = useMemo(() => {
      return activeGame?.teamNames || [];
  }, [activeGame]);

  useEffect(() => {
    if (activeGame) {
      setAiDifficulty(activeGame.aiDifficulty || 3);
    }
  }, [activeGame]);

  const teamsWithRivals = useMemo(() => {
      if (!activeGame) return [];
      const humanTeams = acceptedTeams.map(name => ({name, type: 'H'}));
      // The total number of teams (including AI) is `activeGame.teams`.
      // The number of human teams is `humanTeams.length`.
      // The number of AI rivals is `activeGame.teams - humanTeams.length`.
      // The teacher dashboard shows `teams` as the number of human teams, which is wrong.
      const numAIRivals = activeGame.teams - humanTeams.length;
      const rivalTeams = Array.from({length: numAIRivals > 0 ? numAIRivals : 0}, (_, i) => ({name: `IA Rival ${i + 1}`, type: 'IA'}));
      return [...humanTeams, ...rivalTeams];
  }, [acceptedTeams, activeGame]);

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
    
    setIsAccepting(true);
    try {
      await acceptJoinRequests(activeGame.id, selectedRequests);
      toast({
          title: "Solicitudes Aceptadas",
          description: `${selectedRequests.length} equipo(s) han sido añadidos a la partida.`
      });
      setSelectedRequests([]);
      setRequestsDialogOpen(false);
    } catch (error) {
      console.error("Error accepting requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron aceptar las solicitudes."
      });
    } finally {
        setIsAccepting(false);
    }
  };
  
  const handleRemoveTeam = async (teamNameToRemove: string) => {
    if (!activeGame) return;
    try {
      await removeTeamFromGame(activeGame.id, teamNameToRemove);
      toast({
        title: "Equipo eliminado",
        description: `${teamNameToRemove} ha sido eliminado de la partida.`
      });
    } catch (error) {
       console.error("Error removing team:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar al equipo."
      });
    }
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
                          <Button variant="outline" size="sm" disabled={acceptedTeams.length >= activeGame.teams || pendingTeams.length === 0}>
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
                              <Button onClick={handleAcceptRequests} disabled={selectedRequests.length === 0 || isAccepting}>
                                {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Aceptar Seleccionados
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
              <h4 className="mb-2 font-medium">Equipos en la Partida</h4>
              <div className="rounded-lg border">
                <ScrollArea className="h-64">
                    {gamesLoading ? (
                        <div className="flex items-center justify-center h-full p-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
                    ) : teamsWithRivals.length > 0 ? (
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
                                                Esta acción no se puede deshacer fácilmente. El equipo será eliminado de la partida y el estado del estudiante se reiniciará.
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

    
