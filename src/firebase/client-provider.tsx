
'use client';
import { initializeFirebase, FirebaseProvider } from '.';
import { ReactNode, useState, useEffect } from 'react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const { firebaseApp, auth, firestore } = initializeFirebase();

  useEffect(() => {
    if (firebaseApp && auth && firestore) {
      setFirebaseInitialized(true);
    }
  }, [firebaseApp, auth, firestore]);

  if (!firebaseInitialized) {
    // You can return a loader here if you want
    return null;
  }

  return (
    <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
