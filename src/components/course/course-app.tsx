import Image from "next/image";
import { AuthPage } from "@/components/auth/auth-page";

export default function CourseApp() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
           <AuthPage />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1526233139389-c72da779774a?q=80&w=2070&auto=format&fit=crop"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="wood ruler"
        />
      </div>
    </div>
  );
}
