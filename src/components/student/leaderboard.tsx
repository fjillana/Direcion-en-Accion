"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Team = {
  rank: number;
  name: string;
  xp: number;
  badge: string;
  kpis: TeamKPIs;
};

type TeamKPIs = {
  cash: string;
  personnelCost: string;
  nma: number;
  marketShare: string;
  morale: string;
  studentTeacherRatio: number;
};

export function Leaderboard() {
  const teams: Team[] = [
    {
      rank: 1,
      name: "Equipo Delta",
      xp: 1800,
      badge: "🚀",
      kpis: {
        cash: "55,000 CC",
        personnelCost: "68%",
        nma: 8.8,
        marketShare: "15%",
        morale: "85%",
        studentTeacherRatio: 23.5,
      },
    },
    {
      rank: 2,
      name: "Equipo Beta",
      xp: 1500,
      badge: "🔥",
      kpis: {
        cash: "32,000 CC",
        personnelCost: "72%",
        nma: 8.5,
        marketShare: "13.5%",
        morale: "78%",
        studentTeacherRatio: 24.0,
      },
    },
    {
      rank: 3,
      name: "Equipo Alfa",
      xp: 1200,
      badge: "👍",
      kpis: {
        cash: "21,000 CC",
        personnelCost: "76%",
        nma: 8.2,
        marketShare: "12%",
        morale: "71%",
        studentTeacherRatio: 25.1,
      },
    },
    {
      rank: 4,
      name: "Equipo Gamma",
      xp: 950,
      badge: "🐢",
      kpis: {
        cash: "15,000 CC",
        personnelCost: "79%",
        nma: 7.9,
        marketShare: "11%",
        morale: "65%",
        studentTeacherRatio: 25.8,
      },
    },
  ].sort((a, b) => b.xp - a.xp);

  const currentUserTeam = "Equipo Beta";
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleRowClick = (team: Team) => {
    setSelectedTeam(team);
  };

  const kpiDescriptions = {
    cash: "Saldo de tesorería",
    personnelCost: "Coste personal / Ingresos",
    nma: "Nota Media Alumnado",
    marketShare: "Cuota de mercado",
    morale: "Moral del personal",
    studentTeacherRatio: "Ratio Alumnos/Profesor",
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard General</CardTitle>
          <CardDescription>
            Clasificación de equipos basada en puntos de experiencia (XP). Haz
            clic en un equipo para ver sus KPIs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ranking</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">XP Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow
                  key={team.name}
                  onClick={() => handleRowClick(team)}
                  className={
                    `cursor-pointer ${team.name === currentUserTeam ? "bg-accent/50" : ""}`
                  }
                >
                  <TableCell className="font-bold text-lg">
                    <span className="mr-2">{team.badge}</span>
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {team.name}
                    {team.name === currentUserTeam && (
                      <Badge className="ml-2">Tu Equipo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {new Intl.NumberFormat('es-ES').format(team.xp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de KPIs: {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                  Indicadores clave de rendimiento para la ronda actual.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableBody>
                    {Object.entries(selectedTeam.kpis).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {kpiDescriptions[key as keyof TeamKPIs]}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
