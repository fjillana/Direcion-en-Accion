
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // Asumiendo que tienes un hook de autenticación similar
import { Loader2 } from 'lucide-react'; // O cualquier componente de carga que uses
import CourseApp from '@/components/course/course-app';

export default function Home() {
  // 1. Usa tu hook de autenticación para obtener el usuario y el estado de carga.
  //    Es CRÍTICO que este hook devuelva un estado `isLoading` que sea `true`
  //    hasta que el perfil de usuario COMPLETO (con el 'role' de Firestore) se haya cargado.
  const { user, isLoading } = useAuth(); 
  const router = useRouter();

  // 2. Implementa un useEffect que reaccione a los cambios en el usuario y el estado de carga.
  useEffect(() => {
    // Solo actúa cuando la carga ha terminado y tenemos un usuario definitivo.
    if (!isLoading && user) {
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard'); // Redirige al dashboard del instructor
      } else if (user.role === 'student') {
        router.push('/student/dashboard'); // Redirige al dashboard del estudiante
      }
      // Puedes añadir más roles si es necesario.
    }
  }, [user, isLoading, router]);

  // 3. Muestra un estado de carga mientras se determina el rol y se redirige.
  //    Esto previene que se muestre brevemente la página incorrecta.
  //    Si el `user` ya está cargado, este componente mostrará una pantalla de carga
  //    durante el breve instante que tarda la redirección del `useEffect`.
  if (isLoading || user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  // 4. Muestra la página principal o el componente de login solo si la carga ha terminado
  //    Y se ha determinado que NO hay un usuario logueado.
  return (
    <main>
      <CourseApp />
    </main>
  );
}
