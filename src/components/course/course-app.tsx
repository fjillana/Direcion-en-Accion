
import { AuthPage } from "@/components/auth/auth-page";

export default function CourseApp() {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-primary lg:block">
         <div className="flex flex-col h-full justify-center items-center text-primary-foreground p-12 text-center">
            <h1 className="text-5xl font-bold font-headline mb-4">Dirección en acción</h1>
            <p className="text-lg text-primary-foreground/80">
              Transforma la gestión educativa en una experiencia interactiva y competitiva.
            </p>
         </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-primary lg:bg-background">
        <div className="mx-auto grid w-[350px] gap-6">
          <AuthPage />
        </div>
      </div>
    </div>
  );
}
