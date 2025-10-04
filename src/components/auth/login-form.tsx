
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { FirebaseError } from "firebase/app";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isLogin) {
        const user = await login(values.email, values.password);
        if (user.role === 'teacher') {
          router.push("/teacher/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      } else {
        // Registration is always for students
        await register(values.email, values.password, "estudiante");
        toast({
          title: "¡Cuenta Creada!",
          description: "Bienvenido/a. Redirigiendo a tu panel de estudiante...",
        });
        router.push("/student/dashboard");
      }
    } catch (error: any) {
        let description = "Ha ocurrido un error inesperado.";
        if (error instanceof FirebaseError) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                description = "Credenciales incorrectas. Por favor, verifica tu email y contraseña. Si eres un nuevo usuario, necesitas registrarte.";
            } else if (error.code === 'auth/email-already-in-use') {
                description = "Este correo electrónico ya está en uso. Por favor, inicia sesión o utiliza otro correo.";
            }
        }
        
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: description,
        });
    }
  }

  const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611,20.083H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34.05,44,31.6C44,27.9,44,24.4,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/90">Correo electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="nombre@ejemplo.com" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/90">Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card/0 px-2 text-white/70 backdrop-blur-sm">
            O continuar con
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full bg-white/90 text-foreground hover:bg-white">
        <GoogleIcon className="mr-2 h-4 w-4" />
        Google
      </Button>
      <p className="text-center text-sm text-white/70">
        {isLogin ? "¿Eres estudiante y no tienes cuenta?" : "¿Ya tienes una cuenta?"}
        <Button
          variant="link"
          className="px-1 text-primary-foreground/90 hover:text-primary-foreground"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </Button>
      </p>
    </div>
  );
}

  