
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Moon, Sun, Camera, LogOut } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStudentGame } from "@/hooks/useStudentGame";

export function UserNav({
  userType = "teacher",
}: {
  userType?: "teacher" | "student";
}) {
  const isTeacher = userType === "teacher";
  const { studentGame, abandonGame } = useStudentGame();
  
  const initialUser = {
    name: isTeacher ? "Profesor" : (studentGame?.teamName || "Estudiante"),
    email: isTeacher ? "profesor@example.com" : `estudiante.${(studentGame?.teamName || 'test').toLowerCase().replace(' ','.')}@example.com`,
    avatar: `https://picsum.photos/seed/${userType}-${studentGame?.teamName || 'avatar'}/40/40`,
  };

  const [user, setUser] = useState(initialUser);
  const [isProfileOpen, setProfileOpen] = useState(false);
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  
  useEffect(() => {
    setUser({
      name: isTeacher ? "Profesor" : (studentGame?.teamName || "Estudiante"),
      email: isTeacher ? "profesor@example.com" : `estudiante.${(studentGame?.teamName || 'test').toLowerCase().replace(' ','.')}@example.com`,
      avatar: `https://picsum.photos/seed/${userType}-${studentGame?.teamName || 'avatar'}/40/40`,
    });
  }, [studentGame, isTeacher, userType]);
  
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const handleSaveChanges = () => {
    setUser(prevUser => ({ ...prevUser, name, email }));
    setProfileOpen(false);
  };
  
  const changeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setUser(prevUser => ({...prevUser, avatar: `https://picsum.photos/seed/${randomSeed}/40/40`}));
  }

  const userDetails = {
    memberSince: isTeacher ? "1 Enero, 2024" : "15 Febrero, 2024",
    lastLogin: new Date().toLocaleString("es-ES"),
  };


  return (
    <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Perfil
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Ajustes</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Claro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Oscuro</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            {!isTeacher && studentGame?.status === 'joined' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <LogOut className="mr-2 h-4 w-4" />
                            Abandonar Partida
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de que quieres abandonar la partida?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán todos los datos de tu equipo en esta partida y tendrás que solicitar unirte de nuevo.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={abandonGame}
                        >
                            Sí, abandonar partida
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">Cerrar sesión</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Realiza cambios en tu perfil. Haz clic en guardar cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
           <div className="flex items-center space-x-4">
            <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={changeAvatar}>
                    <Camera className="h-4 w-4"/>
                    <span className="sr-only">Cambiar avatar</span>
                </Button>
            </div>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Miembro desde: {userDetails.memberSince}</p>
                <p className="text-sm text-muted-foreground">Última conexión: {userDetails.lastLogin}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
