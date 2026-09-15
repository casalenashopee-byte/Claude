import Link from "next/link";
import { RequestResetForm } from "./RequestResetForm";

export default function EsqueciSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="eyebrow">VendaFácil</span>
          <h1 className="mt-2 font-serif text-3xl font-medium">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-muted">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <RequestResetForm />

        <p className="mt-6 text-center text-sm text-muted">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
