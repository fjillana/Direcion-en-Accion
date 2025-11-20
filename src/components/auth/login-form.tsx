
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
import { useAuth, type UserRole } from "@/hooks/use-auth";
import { FirebaseError } from "firebase/app";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
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

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  role: z.enum(["teacher", "student", "superadmin"]).optional(),
});

const resetSchema = z.object({
    resetEmail: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
});

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [resetEmail, setResetEmail] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { login, register, sendPasswordReset } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        const role = values.role || 'student';
        await register(values.email, values.password, role as UserRole);
        toast({
          title: "¡Cuenta Creada!",
          description: `Bienvenido/a. Redirigiendo a tu panel...`,
        });
      }
      // The redirection is handled by the useAuth hook and the root page.
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

  const handlePasswordReset = async () => {
    if (!resetEmail) {
        toast({
            variant: "destructive",
            title: "Correo vacío",
            description: "Por favor, introduce tu correo electrónico.",
        });
        return;
    }
    try {
        await sendPasswordReset(resetEmail);
        toast({
            title: "Correo enviado",
            description: "Si tu correo está registrado, recibirás un enlace para restaurar tu contraseña.",
        });
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar el correo de recuperación. Inténtalo de nuevo.",
        });
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="nombre@ejemplo.com" {...field} />
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
                 <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    {isLogin && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground hover:text-primary">¿Olvidaste tu contraseña?</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Restaurar Contraseña</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Introduce tu correo electrónico para recibir un enlace de recuperación.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                     <Input 
                                        type="email" 
                                        placeholder="tu.correo@ejemplo.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handlePasswordReset}>Enviar Correo</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!isLogin && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>¿Qué tipo de usuario eres?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="student" id="r1" />
                        </FormControl>
                        <FormLabel htmlFor="r1" className="font-normal">Estudiante</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="teacher" id="r2" />
                        </FormControl>
                        <FormLabel htmlFor="r2" className="font-normal">Profesor</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="w-full">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </Button>
        </form>
      </Form>
      
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}
        <Button
          variant="link"
          className="px-1"
          onClick={() => {
            setIsLogin(!isLogin);
            form.reset({ email: '', password: '', role: 'student'});
          }}
        >
          {isLogin ? "Regístrate" : "Inicia sesión"}
        </Button>
      </p>
    </div>
  );
}
