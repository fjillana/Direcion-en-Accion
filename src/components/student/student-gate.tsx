
"use client";

import { useStudentGame } from "@/hooks/useStudentGame";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { studentGame, isLoading: isStudentGameLoading, debugStatus } = useStudentGame();
  const router = useRouter();

  const isLoading = isAuthLoading || isStudentGameLoading;

  useEffect(() => {
    // This gate now primarily handles cases where the user somehow ends up
    // on a protected route without being logged in. The initial routing logic
    // is now handled by the root page.tsx.
    if (!isAuthLoading && !user) {
        router.push('/');
    }
  }, [user, isAuthLoading, router]);

  // Pantalla de carga con diagnóstico visual.
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

  // Si la carga ha terminado y el estudiante está pendiente de aprobación
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
  
  // Si estamos en la página de unirse a partida, la mostramos sin comprobar si está en una partida
  if (window.location.pathname === '/student/join-game') {
      if(studentGame?.status === 'joined'){
          router.push('/student/dashboard');
          return null;
      }
      return <>{children}</>;
  }


  // Si la carga ha terminado y el estudiante está en una partida
  if (studentGame?.status === 'joined') {
    return <>{children}</>;
  }

  // Fallback: si por alguna razón llegamos aquí sin un estado válido
  // (p. ej., el usuario navega manualmente a una URL protegida sin partida),
  // mostramos un loader mientras la lógica del useEffect redirige.
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
