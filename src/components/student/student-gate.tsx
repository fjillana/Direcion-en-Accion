
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

  const isLoading = isAuthLoading || isStudentGameLoading;

  useEffect(() => {
    // Wait until all loading is complete before making any redirection decisions
    if (isLoading) {
      return;
    }

    // If loading is done and there's no user, redirect to login
    if (!user) {
      router.push('/');
      return;
    }

    // If loading is done and we have the student's game state
    if (studentGame) {
      const isJoinGamePage = pathname === '/student/join-game';
      
      if (studentGame.status === 'no-game' && !isJoinGamePage) {
        // If not in a game, they MUST be on the join game page
        router.push('/student/join-game');
      } else if ((studentGame.status === 'joined' || studentGame.status === 'pending') && isJoinGamePage) {
        // If they are in a game (or pending) and land on the join page, redirect them away
        router.push('/student/dashboard');
      }
    }
    
  }, [user, studentGame, isLoading, router, pathname]);


  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is pending, show the pending message on any page.
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
  
  // If the user is joined, let them see the content.
  if (studentGame?.status === 'joined' && pathname !== '/student/join-game') {
      return <>{children}</>;
  }

  // If the user has no game, only let them see the join game page.
  if (studentGame?.status === 'no-game' && pathname === '/student/join-game') {
      return <>{children}</>;
  }

  // Fallback loader during the brief moment of redirection.
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
