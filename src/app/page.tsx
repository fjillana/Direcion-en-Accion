
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
    // Wait until all loading is complete before making any redirection decisions
    if (isLoading) {
      return;
    }

    // SCENARIO 1: User is logged in
    if (user) {
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'superadmin') {
        router.push('/superadmin/dashboard');
      } else if (user.role === 'student' && studentGame) {
        // For students, we now have definitive studentGame state
        if (studentGame.status === 'joined' || studentGame.status === 'pending') {
          router.push('/student/dashboard');
        } else { // 'no-game'
          router.push('/student/join-game');
        }
      }
      // If student role but studentGame is somehow null, the loader will continue spinning,
      // which is a safe state until the data is consistent.
    }
    
    // SCENARIO 2: No user is logged in (and not loading).
    // The CourseApp will be rendered, so no action is needed here.

  }, [user, studentGame, isLoading, router]);

  // Show a loader if we are in any loading state OR if a user is logged in
  // but we are still waiting for the redirection logic in useEffect to run.
  // This prevents any flash of the login page for an already logged-in user.
  if (isLoading || user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  // Only show the main login page if we're done loading and there is definitively NO user.
  return (
    <main>
      <CourseApp />
    </main>
  );
}
