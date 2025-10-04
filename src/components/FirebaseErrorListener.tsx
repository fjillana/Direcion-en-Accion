'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client component that will listen for custom Firebase errors
// and throw them to be caught by the Next.js development overlay.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throwing the error here will cause it to be displayed in the
      // Next.js development error overlay.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    // No cleanup function is returned, so the listener is never removed.
  }, []);

  return null; // This component does not render anything.
}
