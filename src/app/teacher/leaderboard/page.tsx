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

export default function TeacherLeaderboardPage() {
  const teams = [
    { rank: 1, name: "Equipo Delta", xp: 1800, peb: 110, grade: 9.8, rounds: 5 },
    { rank: 2, name: "Equipo Beta", xp: 1500, peb: 105, grade: 9.2, rounds: 5 },
    { rank: 3, name: "Equipo Alfa", xp: 1200, peb: 95, grade: 8.5, rounds: 5 },
    { rank: 4, name: "Equipo Gamma", xp: 950, peb: 88, grade: 7.8, rounds: 5 },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Leaderboard General</h1>
      <Card>
        <CardHeader>
          <CardTitle>Clasificación de todos los juegos</CardTitle>
          <CardDescription>
            Rendimiento global de los equipos. Puedes filtrar por juego.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Ranking</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">XP Total</TableHead>
                <TableHead className="text-right">PEB Medio</TableHead>
                <TableHead className="text-right">Nota Media</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team.name}>
                  <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {team.xp.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{team.peb}%</TableCell>
                  <TableCell className="text-right">{team.grade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
