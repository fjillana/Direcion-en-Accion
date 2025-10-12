
'use client';
import * as React from 'react';
import { initializeFirebase, FirebaseProvider } from '.';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { ReactNode } from 'react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = React.useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  React.useEffect(() => {
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
