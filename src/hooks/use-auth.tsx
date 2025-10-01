
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation'

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
  login: (email: string, password: string) => User;
  register: (email: string, password: string, name: string) => User;
  logout: () => void;
  updateUser: (updatedData: Partial<Omit<User, 'id' | 'role'>>) => void;
  changePassword: (currentPassword: string, newPassword: string) => void;
  setTheme: (theme: Theme) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'auth_user';
const USERS_DB_KEY = 'users_db'; // Simulated user database

// Helper to safely interact with localStorage
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setLocalStorageItem = <T,>(key: string, value: T) => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }
};

const defaultUsers = {
  "profesor@test.com": {
    id: "user-teacher-01",
    name: "Profesor",
    email: "profesor@test.com",
    password: "password",
    role: "teacher",
    avatar: `https://picsum.photos/seed/teacher-avatar/40/40`,
    theme: "light",
  },
   "estudiante@test.com": {
    id: "user-student-01",
    name: "Estudiante de Prueba",
    email: "estudiante@test.com",
    password: "password",
    role: "student",
    avatar: `https://picsum.photos/seed/student-avatar/40/40`,
    theme: "light",
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, _setTheme] = useState<Theme>('light');
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    // Force logout by clearing the stored user
    setLocalStorageItem<User | null>(AUTH_STORAGE_KEY, null);
    setUser(null);
    _setTheme('light');
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme]);
  
  const setTheme = (newTheme: Theme) => {
    _setTheme(newTheme);
    if(user){
        const updatedUser = {...user, theme: newTheme};
        setUser(updatedUser);
        setLocalStorageItem(AUTH_STORAGE_KEY, updatedUser);

        const usersDb = getLocalStorageItem(USERS_DB_KEY, {});
        if(usersDb[user.email]){
            usersDb[user.email].theme = newTheme;
            setLocalStorageItem(USERS_DB_KEY, usersDb);
        }
    }
  };

  const login = (email: string, password: string): User => {
    const usersDb = getLocalStorageItem(USERS_DB_KEY, defaultUsers);
    const userData = usersDb[email];

    if (!userData || userData.password !== password) {
      throw new Error("Correo electrónico o contraseña incorrectos.");
    }
    
    const loggedInUser = { ...userData };
    delete loggedInUser.password;

    setUser(loggedInUser);
    _setTheme(loggedInUser.theme);
    setLocalStorageItem(AUTH_STORAGE_KEY, loggedInUser);
    
    return loggedInUser;
  };
  
  const register = (email: string, password: string, name: string): User => {
    const usersDb = getLocalStorageItem(USERS_DB_KEY, defaultUsers);
    if (usersDb[email]) {
        throw new Error("Este correo electrónico ya está registrado.");
    }
    
    const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role: 'student' as UserRole,
        avatar: `https://picsum.photos/seed/${name}/40/40`,
        theme: 'light' as Theme
    };
    
    usersDb[email] = newUser;
    setLocalStorageItem(USERS_DB_KEY, usersDb);
    
    return login(email, password);
  }

  const logout = () => {
    setUser(null);
    setLocalStorageItem(AUTH_STORAGE_KEY, null);
    router.push('/');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    setLocalStorageItem(AUTH_STORAGE_KEY, updatedUser);
    
    const usersDb = getLocalStorageItem(USERS_DB_KEY, {});
    if(usersDb[user.email]){
        usersDb[user.email] = { ...usersDb[user.email], ...updatedData };
        setLocalStorageItem(USERS_DB_KEY, usersDb);
    }
  };
  
  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("No hay un usuario activo.");
    
    const usersDb = getLocalStorageItem(USERS_DB_KEY, {});
    const userData = usersDb[user.email];
    
    if (!userData || userData.password !== currentPassword) {
        throw new Error("La contraseña actual es incorrecta.");
    }
    
    usersDb[user.email].password = newPassword;
    setLocalStorageItem(USERS_DB_KEY, usersDb);
  };


  const value = useMemo(() => ({
    user,
    isLoading,
    theme,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    setTheme
  }), [user, isLoading, theme]);

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
