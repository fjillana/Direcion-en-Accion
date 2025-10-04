
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  type Firestore,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseCollectionOptions {
  where?: [string, '==', any];
}

export function useCollection<T>(path: string, options?: UseCollectionOptions) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;

    let q: Query<DocumentData>;
    const collRef = collection(firestore, path);

    if (options?.where) {
      q = query(collRef, where(...options.where));
    } else {
      q = query(collRef);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
        setData(docs);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, options?.where?.[0], options?.where?.[1], options?.where?.[2]]);

  return { data, isLoading, error };
}

