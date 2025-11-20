
import { AuthPage } from "@/components/auth/auth-page";
import Image from "next/image";

export default function CourseApp() {
  return (
    <div className="relative min-h-screen w-full">
      <Image
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 flex min-h-screen items-center justify-center md:justify-start p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-sm rounded-xl bg-background/80 p-6 shadow-2xl backdrop-blur-sm border border-white/10">
          <AuthPage />
        </div>
      </div>
    </div>
  );
}
