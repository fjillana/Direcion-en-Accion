
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
import { useFirebase } from "@/firebase/provider";
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
  register: (email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<Omit<User, 'id' | 'role'>>) => void;
  setTheme: (theme: Theme) => void;
  changePassword: (currentPassword: string, newPassword: string) => void;
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
        // User is authenticated, but no profile document exists. Create it now.
        console.warn("User profile not found in Firestore, creating one now.");
        
        // This is a fallback. The role should ideally be determined during registration.
        // We assume a 'student' role as a safe default.
        const role: UserRole = 'student'; 
        const name = firebaseUser.displayName || (role === 'teacher' ? 'Profesor/a' : `Estudiante ${firebaseUser.uid.substring(0, 5)}`);
        const avatar = firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/40/40`;
        
        const newUserProfile: Omit<User, 'id'> = {
            name,
            email: firebaseUser.email!,
            role,
            avatar,
            theme: 'light'
        };

        await setDoc(userRef, newUserProfile);
        const appUser = { ...newUserProfile, id: firebaseUser.uid };
        setUser(appUser);
        _setTheme(appUser.theme);
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
    
    // onAuthStateChanged will trigger handleUser, which now ensures a profile exists.
    // To return the user data immediately, we re-fetch it here.
    const userRef = doc(firestore, "users", userCredential.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // This should theoretically not be reached due to handleUser, but serves as a fallback.
      throw new Error("No se pudo encontrar o crear el perfil de usuario tras el login.");
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

    const name = role === 'teacher' ? 'Profesor/a' : `Estudiante ${firebaseUser.uid.substring(0, 5)}`;
    const avatar = `https://picsum.photos/seed/${firebaseUser.uid}/40/40`;
    await updateProfile(firebaseUser, { displayName: name, photoURL: avatar });

    const newUser: Omit<User, 'id'> = {
        name,
        email,
        role,
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

    setUser(prevUser => prevUser ? ({ ...prevUser, ...prevUser, ...updatedData }) : null);
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth || !auth.currentUser) throw new Error("Usuario no autenticado.");
    // Re-authentication is needed for security-sensitive operations
    const { EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    
    try {
        await reauthenticateWithCredential(auth.currentUser, credential);
        const { updatePassword } = await import("firebase/auth");
        await updatePassword(auth.currentUser, newPassword);
    } catch(error) {
        console.error("Error al cambiar la contraseña", error);
        throw error; // Re-throw to be caught in the component
    }
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
