
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useStudentGame } from '@/hooks/useStudentGame';
import { Loader2 } from 'lucide-react';
import CourseApp from '@/components/course/course-app';

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { studentGame, isLoading: isStudentGameLoading } = useStudentGame();
  const router = useRouter();

  const isLoading = isAuthLoading || isStudentGameLoading;

  useEffect(() => {
    // 1. No tomar ninguna decisión de enrutamiento mientras algo esté cargando.
    // Esta es la barrera clave contra la condición de carrera.
    if (isLoading) {
      return;
    }

    // 2. Si la carga ha terminado y hay un usuario logueado.
    if (user) {
      // 3. Tomar decisiones de enrutamiento basadas en el estado final y fiable.
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'superadmin') {
        router.push('/superadmin/dashboard');
      } else if (user.role === 'student' && studentGame) {
        // Para estudiantes, studentGame ya tiene su estado definitivo.
        if (studentGame.status === 'joined' || studentGame.status === 'pending') {
          router.push('/student/dashboard');
        } else { // 'no-game'
          router.push('/student/join-game');
        }
      }
    }
    
    // 4. Si la carga ha terminado y no hay usuario, se renderizará CourseApp.

  }, [user, studentGame, isLoading, router]);

  // Muestra un cargador a pantalla completa si estamos en cualquier estado de carga
  // O si el usuario está logueado pero estamos esperando la redirección.
  // Esto evita el parpadeo de la página de login para un usuario ya autenticado.
  if (isLoading || user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  // Solo muestra la página principal de login si hemos terminado de cargar y está confirmado que NO hay usuario.
  return (
    <main>
      <CourseApp />
    </main>
  );
}
