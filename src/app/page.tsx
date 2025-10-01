import { AuthPage } from "@/components/auth/auth-page";
import Image from "next/image";
import { Briefcase, Target, Users, Wand2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-4">
                <div className="flex items-center justify-center size-14 rounded-2xl bg-primary text-primary-foreground">
                    <Briefcase className="size-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-headline">Dirección en Acción</h1>
                    <p className="text-muted-foreground">La simulación de negocios para futuros líderes.</p>
                </div>
            </div>

            <div className="mb-8 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                    <Target className="size-5 mt-0.5 shrink-0 text-primary" />
                    <p>Compite en un mercado realista, toma decisiones estratégicas y observa su impacto en tiempo real.</p>
                </div>
                 <div className="flex items-start gap-3">
                    <Users className="size-5 mt-0.5 shrink-0 text-primary" />
                    <p>Gestiona finanzas, reputación y moral del personal para llevar a tu equipo a la cima del leaderboard.</p>
                </div>
                <div className="flex items-start gap-3">
                    <Wand2 className="size-5 mt-0.5 shrink-0 text-primary" />
                    <p>Recibe análisis y sugerencias de una IA experta para mejorar tu aprendizaje en cada ronda.</p>
                </div>
            </div>
            
            <AuthPage />
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://picsum.photos/seed/business-landing/1200/1800"
          alt="Business simulation"
          layout="fill"
          objectFit="cover"
          data-ai-hint="modern office"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    </main>
  );
}
