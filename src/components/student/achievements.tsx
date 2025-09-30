import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, HeartHandshake, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const BadgeIcon = ({
  icon: Icon,
  unlocked,
  colorClass,
}: {
  icon: React.ElementType;
  unlocked: boolean;
  colorClass: string;
}) => (
  <div
    className={cn(
      "relative flex h-24 w-24 items-center justify-center rounded-lg transition-colors",
      unlocked ? `${colorClass}/20` : "bg-muted"
    )}
  >
    <Icon
      className={cn(
        "h-12 w-12 transition-colors",
        unlocked ? colorClass.replace("bg-", "text-") : "text-muted-foreground"
      )}
    />
  </div>
);

export function Achievements() {
  const badges = [
    {
      name: "El Financiero",
      unlocked: true,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      name: "El de RR.PP.",
      unlocked: true,
      icon: HeartHandshake,
      color: "bg-rose-500",
    },
    { name: "El de Equipo", unlocked: false, icon: Users, color: "bg-blue-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Logros</CardTitle>
        <CardDescription>
          Badges obtenidos por el rendimiento excepcional de tu equipo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center gap-8 pt-6">
        {badges.map((badge) => (
          <div key={badge.name} className="flex flex-col items-center gap-2">
            <BadgeIcon
              icon={badge.icon}
              unlocked={badge.unlocked}
              colorClass={badge.color}
            />
            <span
              className={cn(
                "text-sm font-medium",
                badge.unlocked ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {badge.name}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
