

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


export type Theme = "light" | "dark";
export type UserRole = "teacher" | "student" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  theme: Theme;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  theme: Theme;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<Omit<User, 'id' | 'role'>>) => void;
  setTheme: (theme: Theme) => void;
  changePassword: (currentPassword: string, newPassword: string) => void;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, _setTheme] = useState<Theme>('light');
  const router = useRouter();

  const handleUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser && firestore) {
      const userRef = doc(firestore, "users", firebaseUser.uid);
      try {
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'id'|'avatar'>;
          const appUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || userData.name,
            email: firebaseUser.email!,
            avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/40/40`,
            role: userData.role,
            theme: userData.theme || 'light',
          };
          setUser(appUser);
          _setTheme(appUser.theme);
        } else {
          // This case can be hit during registration before the doc is created.
        }
      } catch (error) {
         const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [firestore]);
  
  useEffect(() => {
    if (!auth) {
      setIsLoading(true);
      return;
    };
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, [auth, handleUser]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme]);
  
  const setTheme = (newTheme: Theme) => {
    _setTheme(newTheme);
    if(user && firestore){
        const userRef = doc(firestore, "users", user.id);
        setDoc(userRef, { theme: newTheme }, { merge: true }).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: { theme: newTheme },
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    if (!auth || !firestore) throw new Error("Firebase no está inicializado.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const userRef = doc(firestore, "users", userCredential.user.uid);
    
    // This awaits the getDoc call, but the error will be caught by the outer try/catch in LoginForm
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        throw new Error("No se pudo encontrar el perfil de usuario tras el login.");
    }

    const appUser: User = {
      id: userCredential.user.uid,
      name: userDoc.data().name,
      email: userCredential.user.email!,
      avatar: userCredential.user.photoURL || `https://picsum.photos/seed/${userCredential.user.uid}/40/40`,
      role: userDoc.data().role,
      theme: userDoc.data().theme || 'light'
    };
    
    setUser(appUser);
    _setTheme(appUser.theme);
    return appUser;
  };
  
  const register = async (email: string, password: string, role: UserRole): Promise<User> => {
    if (!auth || !firestore) throw new Error("Firebase no está inicializado.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    let name = role === 'teacher' ? 'Profesor/a' : `Estudiante ${firebaseUser.uid.substring(0, 5)}`;
    if (role === 'superadmin') {
      name = 'Administrador';
    }
    const avatar = `https://picsum.photos/seed/${firebaseUser.uid}/40/40`;
    await updateProfile(firebaseUser, { displayName: name, photoURL: avatar });

    const newUser: Omit<User, 'id'> = {
        name,
        email,
        role,
        avatar,
        theme: 'light'
    };

    setDoc(doc(firestore, "users", firebaseUser.uid), newUser, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: `users/${firebaseUser.uid}`,
          operation: 'create',
          requestResourceData: newUser,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    const appUser = { ...newUser, id: firebaseUser.uid };
    setUser(appUser);
    _setTheme(appUser.theme);
    return appUser;
  }

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user || !auth.currentUser || !firestore) return;

    await updateProfile(auth.currentUser, { 
      displayName: updatedData.name, 
      photoURL: updatedData.avatar 
    });
    
    const userRef = doc(firestore, "users", user.id);
    const dataToSave = { 
        name: updatedData.name, 
        email: updatedData.email,
        avatar: updatedData.avatar
    };

    setDoc(userRef, dataToSave, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    setUser(prevUser => prevUser ? ({ ...prevUser, ...prevUser, ...updatedData }) : null);
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth || !auth.currentUser) throw new Error("Usuario no autenticado.");
    const { EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    
    try {
        await reauthenticateWithCredential(auth.currentUser, credential);
        const { updatePassword } = await import("firebase/auth");
        await updatePassword(auth.currentUser, newPassword);
    } catch(error) {
        throw error; // Re-throw to be caught in the component
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error("Firebase no está inicializado.");
    await sendPasswordResetEmail(auth, email);
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    theme,
    login,
    register,
    logout,
    updateUser,
    setTheme,
    changePassword,
    sendPasswordReset,
  }), [user, isLoading, theme, auth, firestore]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

