
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentGame } from "@/hooks/useStudentGame";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const { studentGame, isLoading, checkGameStatus } = useStudentGame();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!studentGame || studentGame.status === 'no-game') {
        router.push('/student/join-game');
      }
    }
  }, [studentGame, isLoading, router]);


  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (studentGame?.status === 'pending') {
    return (
        <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <CardTitle>Solicitud Enviada</CardTitle>
                    <CardDescription>
                        Tu solicitud para unirte a la partida "{studentGame.gameName}" está pendiente de aprobación por parte del profesor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Por favor, espera a que el profesor acepte tu solicitud. Puedes refrescar el estado de tu solicitud.</p>
                    <Button onClick={checkGameStatus}>Refrescar Estado</Button>
                </CardContent>
            </Card>
      </div>
    );
  }
  
  if (studentGame?.status === 'joined') {
      return <>{children}</>;
  }

  // Fallback case for redirection
  return (
    <div className="flex h-full w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
