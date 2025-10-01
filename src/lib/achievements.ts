
import { DollarSign, HeartHandshake, Award } from "lucide-react";
import type { TeamPerformanceData } from "@/hooks/use-games";

export interface Achievement {
  name: string;
  icon: React.ElementType;
  description: string;
  unlocked: boolean;
  check: (history: TeamPerformanceData[]) => boolean;
}

const achievementsList: Omit<Achievement, 'unlocked'>[] = [
  { 
    name: "El Financiero", 
    icon: DollarSign, 
    description: "Maestría en la gestión de las finanzas. Otorgado al equipo que mejor gestiona sus recursos económicos, manteniendo un remanente prudente y maximizando el PEB de Finanzas.",
    check: (history) => history.some(round => round.finances.peb > 100)
  },
  { 
    name: "El de RR.PP.", 
    icon: HeartHandshake, 
    description: "Excelente reputación y relaciones públicas. Se concede al centro con mayor reputación, mejorando la Nota Media de Alumnos y subiendo en el ranking.",
    check: (history) => history.some(round => round.kpis.nma > 8.5)
  },
  { 
    name: "El de Equipo", 
    icon: Award, 
    description: "Gran gestión del personal y alta moral. Destaca al grupo que mejor cuida la moral del personal, mantiene un buen ratio alumnos/profesor y evita huelgas.",
    check: (history) => history.some(round => round.kpis.morale > 90)
  },
];

export function getAchievementsStatus(history: TeamPerformanceData[]): Achievement[] {
  return achievementsList.map(ach => ({
    ...ach,
    unlocked: ach.check(history)
  }));
}
