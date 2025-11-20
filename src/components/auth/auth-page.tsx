import { LoginForm } from "@/components/auth/login-form";
import { Briefcase, Target, Users, Wand2 } from "lucide-react";

export function AuthPage() {
  return (
    <div className="flex flex-col gap-6 text-card-foreground/90">
        <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold font-headline text-card-foreground">Dirección en Acción</h1>
                <p className="text-balance text-card-foreground/80">
                    La simulación de negocios para futuros líderes.
                </p>
            </div>
        </div>
        
        <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-2">
                <Target className="h-5 w-5 text-primary shrink-0 mt-0.5"/>
                <span>Compite en un mercado realista, toma decisiones estratégicas y observa su impacto en tiempo real.</span>
            </li>
            <li className="flex items-start gap-2">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5"/>
                <span>Gestiona finanzas, reputación y moral del personal para llevar a tu equipo a la cima del leaderboard.</span>
            </li>
            <li className="flex items-start gap-2">
                <Wand2 className="h-5 w-5 text-primary shrink-0 mt-0.5"/>
                <span>Recibe análisis y sugerencias de una IA experta para mejorar tu aprendizaje en cada ronda.</span>
            </li>
        </ul>

        <div className="space-y-2">
          <h2 className="font-semibold text-card-foreground">Comienza ahora</h2>
          <LoginForm />
        </div>
    </div>
  );
}
