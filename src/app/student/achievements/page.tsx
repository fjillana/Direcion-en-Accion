
"use client";

import { StudentGate } from "@/components/student/student-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentGame } from "@/hooks/useStudentGame";
import { getAchievementsStatus, type Achievement } from "@/lib/achievements";
import { useMemo } from "react";


export default function AchievementsPage() {
  const { studentGame } = useStudentGame();
  const performanceHistory = studentGame?.performanceHistory || [];

  const achievements = useMemo(() => getAchievementsStatus(performanceHistory), [performanceHistory]);

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
