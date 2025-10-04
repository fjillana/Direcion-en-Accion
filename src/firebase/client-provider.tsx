
'use client';
import { initializeFirebase, FirebaseProvider } from '.';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { ReactNode, useState, useEffect } from 'react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    // initializeFirebase() will only be called on the client side
    const firebaseServices = initializeFirebase();
    setServices(firebaseServices);
  }, []);

  if (!services) {
    // You can return a loader here if you want
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
