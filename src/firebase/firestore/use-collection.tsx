
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
import { useAuth, useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions {
  where?: [string, '==', any];
}

export function useCollection<T>(path: string, options?: UseCollectionOptions) {
  const firestore = useFirestore();
  const auth = useAuth();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Do not attempt to fetch data if firestore or auth is not available
    if (!firestore || !auth) {
        setIsLoading(false);
        return;
    };

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
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
        setData(null); // Clear data on error
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, auth, path, options?.where?.[0], options?.where?.[1], options?.where?.[2]]);

  return { data, isLoading };
}
