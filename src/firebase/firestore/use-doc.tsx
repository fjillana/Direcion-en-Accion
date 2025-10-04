
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  type Firestore,
  type DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useDoc<T>(path: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const docRef = doc(firestore, path);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, path]);

  return { data, isLoading, error };
}
