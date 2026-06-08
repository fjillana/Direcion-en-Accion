
"use client";

import { useStudentGame } from "@/hooks/useStudentGame";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { studentGame, isLoading: isStudentGameLoading, debugStatus, abandonGame } = useStudentGame();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = isAuthLoading || isStudentGameLoading;

  useEffect(() => {
    // This effect handles redirections AFTER the loading state is resolved.
    if (isLoading) {
      return; // Do nothing while loading
    }

    // Redirect unauthenticated users
    if (!user) {
      router.push('/');
      return;
    }
    
    // Logic for authenticated students
    if (user.role === 'student') {
        const isJoined = studentGame?.status === 'joined';
        const isPending = studentGame?.status === 'pending';
        const isOnJoinPage = pathname.includes('/join-game');
        
        // If joined or pending, they should be on the dashboard, not the join page.
        if ((isJoined || isPending) && isOnJoinPage) {
            router.push('/student/dashboard');
        }
        // If not in a game, they should be on the join page.
        else if (!isJoined && !isPending && !isOnJoinPage) {
            router.push('/join-game');
        }
    }
    
  }, [user, studentGame, isLoading, router, pathname]);

  // Loading screen with diagnostics.
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] w-full items-center justify-center bg-background p-4">
        <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold">Cargando tu partida...</h1>
            <p className="text-muted-foreground">Esto solo tardará un momento.</p>
             {debugStatus && (
                <div className="mt-4 bg-black text-green-400 p-2 rounded font-mono text-xs max-w-md w-full border border-gray-400 shadow-lg">
                    <p><strong>ESTADO:</strong> {debugStatus}</p>
                </div>
            )}
        </div>
      </div>
    );
  }

  // Pending approval screen.
  if (studentGame?.status === 'pending') {
     return (
        <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <CardTitle>Solicitud Enviada</CardTitle>
                    <CardDescription>
                        Tu solicitud para unirte a la partida "{studentGame.gameName}" con el equipo "{studentGame.teamName}" está pendiente de aprobación por parte del profesor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Por favor, espera a que el profesor acepte tu solicitud. La página se refrescará automáticamente.</p>
                </CardContent>
                <CardFooter className="justify-center pb-6">
                    <Button variant="outline" onClick={abandonGame} className="border-primary text-primary hover:bg-primary/10">
                        Cancelar Solicitud
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }
  
  // If the user is authenticated and loading is finished, render the children.
  // The useEffect above will handle any necessary redirections.
  return <>{children}</>;
}
