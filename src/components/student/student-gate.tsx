
"use client";

import { useStudentGame } from "@/hooks/useStudentGame";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "@/hooks/use-auth";

export function StudentGate({ children }: { children: React.ReactNode }) {
  const { isLoading: isAuthLoading } = useAuth();
  const { studentGame, isLoading: isStudentGameLoading } = useStudentGame();

  const isLoading = isAuthLoading || isStudentGameLoading;

  // Mientras cualquier cosa esté cargando, siempre mostrar un loader.
  // Este componente ya no se encarga de la redirección, solo de proteger el contenido.
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Si la carga ha terminado, la página de inicio ya ha redirigido correctamente.
  // Ahora solo nos preocupamos de lo que se debe mostrar en esta ruta.
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
      
      // Si el estudiante está 'joined', muestra el contenido de la página protegida.
      if (studentGame.status === 'joined') {
        return <>{children}</>;
      }
  }

  // Fallback: si por alguna razón llegamos aquí sin un estado válido
  // (p. ej., si el usuario navega manualmente a una URL protegida sin partida),
  // mostramos un loader mientras la página de inicio se encarga de la redirección final.
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
       <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
