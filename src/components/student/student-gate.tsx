
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
    // 1. No tomar ninguna decisión de enrutamiento mientras algo esté cargando.
    // Esta es la barrera clave contra la condición de carrera.
    if (isLoading) {
      return;
    }

    // 2. Si no hay usuario logueado, esta ruta no debería ser accesible.
    // El enrutador principal en `page.tsx` debería haberlo manejado, pero esto es una salvaguarda.
    if (!user) {
        router.push('/');
        return;
    }

    // 3. Si el estudiante NO tiene partida, y NO está ya en la página de unirse, redirigir allí.
    if ((!studentGame || studentGame.status === 'no-game') && window.location.pathname !== '/student/join-game') {
        router.push('/student/join-game');
    }

  }, [user, studentGame, isLoading, router]);

  // Pantalla de carga con diagnóstico visual.
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] w-full items-center justify-center bg-gray-50 p-4">
        <div className="text-xl font-bold mb-4">Cargando aplicación...</div>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-w-lg w-full border border-gray-400 shadow-lg">
           <p><strong>ESTADO ACTUAL:</strong></p>
           <p className="mt-2 whitespace-pre-wrap">{debugStatus}</p>
        </div>
      </div>
    );
  }

  // Si la carga ha terminado y el estudiante está pendiente de aprobación
  if (studentGame && studentGame.status === 'pending') {
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
  
  // Si la carga ha terminado y el estudiante está en una partida
  if (studentGame && studentGame.status === 'joined') {
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

    