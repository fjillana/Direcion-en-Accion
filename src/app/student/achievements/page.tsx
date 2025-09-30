import { Achievements } from "@/components/student/achievements";

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Logros del Equipo</h1>
        <p className="text-muted-foreground">
          Reconocimientos obtenidos a lo largo de la simulación.
        </p>
      </div>
      <Achievements />
    </div>
  );
}
