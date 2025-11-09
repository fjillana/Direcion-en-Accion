
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStudentGame } from "@/hooks/useStudentGame";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/use-auth";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { studentGame, isLoading: isStudentGameLoading } = useStudentGame();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthLoading && !user) {
        router.push('/');
        return;
    }
    
    if (!isStudentGameLoading && studentGame) {
      if (studentGame.status === 'no-game' && pathname !== '/student/join-game') {
        router.push('/student/join-game');
      } else if (studentGame.status === 'joined' && pathname === '/student/join-game') {
        router.push('/student/dashboard');
      }
    }
  }, [user, studentGame, isAuthLoading, isStudentGameLoading, router, pathname]);


  if (isAuthLoading || isStudentGameLoading) {
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
                    <p className="text-muted-foreground mb-4">Por favor, espera a que el profesor acepte tu solicitud. El estado se refrescará automáticamente.</p>
                </CardContent>
            </Card>
      </div>
    );
  }
  
  if (studentGame?.status === 'joined') {
      return <>{children}</>;
  }

  if (pathname === '/student/join-game') {
      return <>{children}</>;
  }

  // Fallback for redirection or initial load
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
