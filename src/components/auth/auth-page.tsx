import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { Briefcase } from "lucide-react";

export function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-primary text-primary-foreground">
            <Briefcase className="size-8" />
          </div>
        </div>
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">
              Dirección en acción
            </CardTitle>
            <CardDescription>
              Bienvenido de nuevo. Inicia sesión para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">O entra como invitado:</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link
              href="/student/dashboard"
              className="font-medium text-primary hover:underline"
            >
              Estudiante
            </Link>
            <Link
              href="/teacher/dashboard"
              className="font-medium text-primary hover:underline"
            >
              Profesor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
