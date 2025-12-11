
"use client";

import { useStudentGame } from "@/hooks/useStudentGame";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { studentGame, isLoading: isStudentGameLoading, debugStatus } = useStudentGame();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = isAuthLoading || isStudentGameLoading;

  useEffect(() => {
    // Redirect unauthenticated users to the login page.
    if (!isAuthLoading && !user) {
      router.push('/');
    }

    // Redirect a 'joined' student away from the 'join-game' page.
    if (pathname === '/student/join-game' && studentGame?.status === 'joined') {
      router.push('/student/dashboard');
    }
    
  }, [user, isAuthLoading, router, pathname, studentGame?.status]);

  // Loading screen with diagnostics.
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] w-full items-center justify-center bg-gray-50 p-4">
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
  
  // If on the join-game page and not joined, show the page.
  if (pathname === '/student/join-game') {
      return <>{children}</>;
  }

  // If the student is joined, show the protected content.
  if (studentGame?.status === 'joined') {
    return <>{children}</>;
  }

  // Fallback: If for some reason we get here without a valid state
  // (e.g., user navigates manually to a protected URL without a game),
  // show a loader while the useEffect logic redirects.
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
