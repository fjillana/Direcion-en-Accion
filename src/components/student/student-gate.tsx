
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStudentGame } from "@/hooks/useStudentGame";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/hooks/use-auth";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { studentGame, isLoading: isStudentGameLoading } = useStudentGame();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = isAuthLoading || isStudentGameLoading;

  useEffect(() => {
    // This gate now focuses on protecting routes, not initial redirection.
    // The root page.tsx handles initial redirection.
    if (isLoading) {
      return;
    }

    // If student state is loaded, enforce routing rules.
    if (studentGame && user) {
      const isJoinGamePage = pathname === '/student/join-game';
      
      // If student has a game but is on the join page, redirect to dashboard.
      if ((studentGame.status === 'joined' || studentGame.status === 'pending') && isJoinGamePage) {
        router.push('/student/dashboard');
      }
      
      // If student has no game but is NOT on the join page, redirect them there.
      else if (studentGame.status === 'no-game' && !isJoinGamePage) {
        router.push('/student/join-game');
      }
    } else if (!user) {
      // If no user is logged in, send to login page.
      router.push('/');
    }

  }, [studentGame, user, isLoading, router, pathname]);

  // While loading, always show a loader.
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is pending, show the pending message on any student page.
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
  
  // If state is loaded and routing rules have been checked, show the children.
  // The useEffect above will handle redirection if the user is on the wrong page.
  if (studentGame) {
      return <>{children}</>;
  }

  // Fallback loader for any brief transitional state.
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
