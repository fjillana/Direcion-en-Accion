
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

  const isLoading = isAuthLoading || isStudentGameLoading;

  // While loading, always show a loader.
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is finished but there's no user, it means they logged out.
  // The root page will handle redirection to login. Show a loader to prevent flashes.
  if (!user) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If state is loaded and routing rules have been checked by root page, proceed.
  if (studentGame) {
      if(studentGame.status === 'pending') {
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
      
      // If the student is 'joined', show the content.
      if (studentGame.status === 'joined') {
        return <>{children}</>;
      }
  }

  // Fallback for any brief transitional state or unexpected issues.
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
