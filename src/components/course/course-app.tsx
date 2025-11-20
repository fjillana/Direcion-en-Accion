import { AuthPage } from "@/components/auth/auth-page";

export default function CourseApp() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <AuthPage />
      </div>
    </div>
  );
}
