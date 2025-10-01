
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GameConfigForm, GameConfig } from "@/components/teacher/game-config-form";
import { PlusCircle, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useGames } from "@/hooks/use-games";
import type { Game } from "@/hooks/use-games";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const { games, addGame, removeGame, setActiveGameId } = useGames();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreateGame = (data: GameConfig) => {
    const newGame: Game = {
      id: (games.length > 100 ? Math.random() : games.length + 1).toString(),
      name: data.gameName,
      round: 1,
      teams: data.numTeams,
      teamNames: [], // Initialize with an empty array of names
      status: "En curso",
      numRounds: data.numRounds,
      initialFunds: data.initialFunds,
      newStudentsPerRound: data.newStudentsPerRound,
      aiDifficulty: data.aiDifficulty,
    };
    addGame(newGame);
    setDialogOpen(false);
  };
  
  const handleManageGame = (gameId: string) => {
    setActiveGameId(gameId);
    router.push(`/teacher/game/${gameId}`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Mis Juegos
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nuevo Juego
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Configuración del Juego</DialogTitle>
              <DialogDescription>
                Define los parámetros para tu nueva simulación de negocios.
              </DialogDescription>
            </DialogHeader>
            <GameConfigForm onCreateGame={handleCreateGame} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id} className="flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{game.name}</CardTitle>
                      <CardDescription>
                        <Badge
                          variant={
                            game.status === "En curso" ? "default" : "secondary"
                          }
                          className="mr-2"
                        >
                          {game.status}
                        </Badge>
                        Ronda {game.round} / {game.numRounds}
                      </CardDescription>
                    </div>
                     <AlertDialog>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar Juego
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la partida
                            y todos sus datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeGame(game.id)}>
                            Sí, eliminar partida
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-muted-foreground">
                <p>{game.teamNames.length} de {game.teams} equipos humanos participando.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" onClick={() => handleManageGame(game.id)}>
                <Link href={`/teacher/game/${game.id}`}>Administrar Juego</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
