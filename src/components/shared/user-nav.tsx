
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
import { useState, useEffect } from "react";
import { Moon, Sun, Camera, KeyRound, LogOut } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth, type Theme } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, updateUser, changePassword, setTheme, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isPasswordOpen, setPasswordOpen] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleSaveChanges = () => {
    if (!user) return;
    updateUser({ name, email, avatar });
    setProfileOpen(false);
    toast({ title: "Perfil actualizado", description: "Tus cambios han sido guardados." });
  };
  
  const changeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://picsum.photos/seed/${randomSeed}/40/40`);
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Las nuevas contraseñas no coinciden." });
      return;
    }
    try {
      changePassword(currentPassword, newPassword);
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada con éxito." });
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }
  
  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!user) {
    return null;
  }

  return (
    <>
      <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {email}
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
              <DialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setPasswordOpen(true); }}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Cambiar Contraseña</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Ajustes</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Claro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Oscuro</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
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
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={changeAvatar}>
                      <Camera className="h-4 w-4"/>
                      <span className="sr-only">Cambiar avatar</span>
                  </Button>
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
      
      {/* Password Change Dialog */}
       <Dialog open={isPasswordOpen} onOpenChange={setPasswordOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                        Introduce tu contraseña actual y la nueva para actualizarla.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="button" onClick={handlePasswordChange}>Actualizar Contraseña</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
