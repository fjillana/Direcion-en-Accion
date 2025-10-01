import { AuthPage } from "@/components/auth/auth-page";
import Image from "next/image";
import { Briefcase, Target, Users, Wand2 } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full">
      <Image
        src="https://picsum.photos/seed/business-landing/1800/1200"
        alt="Business simulation"
        fill={true}
        className="object-cover"
        data-ai-hint="modern office"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      
      <div className="relative z-10 flex min-h-screen items-center justify-start p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-background/10 p-8 backdrop-blur-sm text-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/80 text-primary-foreground">
              <Briefcase className="size-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline text-white">Dirección en Acción</h1>
              <p className="text-white/80">La simulación de negocios para futuros líderes.</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-white/70">
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
    </main>
  );
}
