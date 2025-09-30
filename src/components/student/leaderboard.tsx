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

export function Leaderboard() {
  const teams = [
    { rank: 1, name: "Equipo Delta", xp: 1800, badge: "🚀" },
    { rank: 2, name: "Equipo Beta", xp: 1500, badge: "🔥" },
    { rank: 3, name: "Equipo Alfa", xp: 1200, badge: "👍" },
    { rank: 4, name: "Equipo Gamma", xp: 950, badge: "🐢" },
  ].sort((a, b) => b.xp - a.xp);

  const currentUserTeam = "Equipo Beta";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard General</CardTitle>
        <CardDescription>
          Clasificación de equipos basada en puntos de experiencia (XP).
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
                className={
                  team.name === currentUserTeam ? "bg-accent/50" : ""
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
                  {team.xp.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
