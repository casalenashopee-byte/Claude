import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="eyebrow">VendaFácil</span>
          <h1 className="mt-2 font-serif text-3xl font-medium">
            Criar sua conta
          </h1>
          <p className="mt-2 text-sm text-muted">
            Leva menos de um minuto — comece a vender hoje.
          </p>
        </div>

        <RegisterForm refCode={ref} />

        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
