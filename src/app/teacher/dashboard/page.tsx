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
import { GameConfigForm, GameConfig }_from "@/components/teacher/game-config-form";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useGames } from "@/hooks/use-games";
import type { Game } from "@/hooks/use-games";

export default function TeacherDashboard() {
  const { games, addGame } = useGames();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateGame = (data: GameConfig) => {
    const newGame: Game = {
      id: (games.length + 1).toString(),
      name: data.gameName,
      round: 1,
      teams: data.numTeams,
      status: "En curso",
    };
    addGame(newGame);
    setDialogOpen(false);
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
                Ronda {game.round}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-muted-foreground">
                <p>{game.teams} equipos participando.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/teacher/game/${game.id}`}>Administrar Juego</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}