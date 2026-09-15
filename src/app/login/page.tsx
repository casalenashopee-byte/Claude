import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="eyebrow">VendaFácil</span>
          <h1 className="mt-2 font-serif text-3xl font-medium">
            Entrar na sua conta
          </h1>
          <p className="mt-2 text-sm text-muted">
            Gestão completa para quem vende sozinho.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link href="/registrar" className="text-brand font-medium hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
