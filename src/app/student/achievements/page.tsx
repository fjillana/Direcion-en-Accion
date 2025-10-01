
import { StudentGate } from "@/components/student/student-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, HeartHandshake, Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const achievements = [
  { 
    name: "El Financiero", 
    icon: DollarSign, 
    description: "Maestría en la gestión de las finanzas. Otorgado al equipo que mejor gestiona sus recursos económicos, manteniendo un remanente prudente y maximizando el PEB de Finanzas.",
    unlocked: true 
  },
  { 
    name: "El de RR.PP.", 
    icon: HeartHandshake, 
    description: "Excelente reputación y relaciones públicas. Se concede al centro con mayor reputación, mejorando la Nota Media de Alumnos y subiendo en el ranking.",
    unlocked: true 
  },
  { 
    name: "El de Equipo", 
    icon: Award, 
    description: "Gran gestión del personal y alta moral. Destaca al grupo que mejor cuida la moral del personal, mantiene un buen ratio alumnos/profesor y evita huelgas.",
    unlocked: false 
  },
];


export default function AchievementsPage() {
  return (
    <StudentGate>
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Logros y Badges</h1>
          <p className="text-muted-foreground">
            Reconocimientos especiales por un desempeño excepcional en áreas clave.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((ach) => (
            <Card key={ach.name} className={cn("flex flex-col", !ach.unlocked && "bg-muted/30")}>
              <CardHeader>
                <div className="flex items-center gap-2">
                    <ach.icon className={cn("h-6 w-6", ach.unlocked ? "text-primary" : "text-muted-foreground")} />
                    <CardTitle>
                        {ach.name}
                    </CardTitle>
                </div>
                 <div className="mt-2">
                    {ach.unlocked ? (
                        <Badge variant="default">Desbloqueado</Badge>
                    ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            <span>Bloqueado</span>
                        </Badge>
                    )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <CardDescription>{ach.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentGate>
  )
}
