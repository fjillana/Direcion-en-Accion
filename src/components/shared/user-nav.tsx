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
} from "@/components/ui/dialog";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function UserNav({
  userType = "teacher",
}: {
  userType?: "teacher" | "student";
}) {
  const isTeacher = userType === "teacher";
  const user = {
    name: isTeacher ? "Profesor" : "Estudiante Beta",
    email: isTeacher ? "profesor@example.com" : "estudiante.beta@example.com",
    avatar: `https://picsum.photos/seed/${userType}-avatar/40/40`,
    memberSince: isTeacher ? "1 Enero, 2024" : "15 Febrero, 2024",
    lastLogin: new Date().toLocaleString("es-ES"),
  };

  const [isProfileOpen, setProfileOpen] = useState(false);

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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Idioma (ES)</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">Cerrar sesión</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil de Usuario</DialogTitle>
          <DialogDescription>
            Información de tu cuenta en la plataforma.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 pt-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="space-y-2 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Miembro desde:</span>
            <span>{user.memberSince}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última conexión:</span>
            <span>{user.lastLogin}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}