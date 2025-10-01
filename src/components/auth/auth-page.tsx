import { LoginForm } from "@/components/auth/login-form";

export function AuthPage() {
  return (
    <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Comienza ahora</h2>
        <LoginForm />
    </div>
  );
}
