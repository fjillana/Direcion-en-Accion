import { TeacherLayout } from "@/components/teacher/teacher-layout";
import { GamesProvider } from "@/hooks/use-games";
import { GameProvider } from "@/hooks/use-game-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <GamesProvider>
      <GameProvider>
        <TeacherLayout>{children}</TeacherLayout>
      </GameProvider>
    </GamesProvider>
  );
}
