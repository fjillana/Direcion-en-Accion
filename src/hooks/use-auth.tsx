
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
  type User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { useFirebase, useFirebaseApp } from "@/firebase/provider";
import { Skeleton } from "@/components/ui/skeleton";


export type Theme = "light" | "dark";
export type UserRole = "teacher" | "student";

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
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<Omit<User, 'id' | 'role'>>) => void;
  setTheme: (theme: Theme) => void;
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
        // This case can happen for a newly registered user before their profile is created
        setUser(null);
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
        setDoc(userRef, { theme: newTheme }, { merge: true });
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    if (!auth || !firestore) throw new Error("Firebase no está inicializado.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const userRef = doc(firestore, "users", userCredential.user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("No se encontró el perfil de usuario.");
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
  
  const register = async (email: string, password: string, name: string): Promise<User> => {
    if (!auth || !firestore) throw new Error("Firebase no está inicializado.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const avatar = `https://picsum.photos/seed/${firebaseUser.uid}/40/40`;
    await updateProfile(firebaseUser, { displayName: name, photoURL: avatar });

    const newUser: Omit<User, 'id'> = {
        name,
        email,
        role: 'student', // Registration is always for students in this app
        avatar,
        theme: 'light'
    };

    await setDoc(doc(firestore, "users", firebaseUser.uid), newUser);
    
    const appUser = { ...newUser, id: firebaseUser.uid };
    setUser(appUser);
    _setTheme(appUser.theme);
    return appUser;
  }

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user || !auth.currentUser || !firestore) return;

    await updateProfile(auth.currentUser, { 
      displayName: updatedData.name, 
      photoURL: updatedData.avatar 
    });
    
    const userRef = doc(firestore, "users", user.id);
    await setDoc(userRef, { 
        name: updatedData.name, 
        email: updatedData.email,
        avatar: updatedData.avatar
    }, { merge: true });

    setUser(prevUser => prevUser ? ({ ...prevUser, ...updatedData }) : null);
  };
  
  // changePassword is not implemented for this refactor as it's a more complex flow.

  const value = useMemo(() => ({
    user,
    isLoading,
    theme,
    login,
    register,
    logout,
    updateUser,
    setTheme,
    changePassword: () => console.warn("Change password not implemented"), // Placeholder
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
