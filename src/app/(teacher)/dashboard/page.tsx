import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GameConfigForm } from "@/components/teacher/game-config-form";
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

export default function TeacherDashboard() {
  const games = [
    {
      id: "1",
      name: "Simulación de Negocios 101",
      round: 3,
      teams: 5,
      status: "En curso",
    },
    {
      id: "2",
      name: "Marketing Avanzado",
      round: 5,
      teams: 4,
      status: "En curso",
    },
    {
      id: "3",
      name: "Gestión Financiera",
      round: 8,
      teams: 6,
      status: "Finalizado",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Mis Juegos
        </h1>
        <Dialog>
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
            <GameConfigForm />
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
