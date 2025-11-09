
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollection } from "@/firebase";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/hooks/use-auth";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export default function SuperAdminDashboard() {
  const { data: users, isLoading } = useCollection<UserProfile>("users");
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", userId);
    try {
        await updateDoc(userRef, { role: newRole });
        toast({
            title: "Rol Actualizado",
            description: `El usuario ha sido actualizado al rol de ${newRole}.`,
        });
    } catch (error) {
        console.error("Error updating role:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo actualizar el rol del usuario.",
        });
    }
  };

  const handleDeleteUser = (userId: string) => {
    toast({
        variant: "destructive",
        title: "Función no implementada",
        description: "La eliminación de usuarios debe realizarse desde la consola de Firebase por seguridad.",
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="grid gap-4">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Superadministrador</h1>
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Visualiza, edita roles y elimina usuarios de la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'teacher' ? 'secondary' : user.role === 'superadmin' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                              disabled={user.role === 'superadmin'}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'teacher')}>
                                Cambiar rol a Profesor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'student')}>
                                Cambiar rol a Estudiante
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
