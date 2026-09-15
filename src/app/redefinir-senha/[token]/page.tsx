import Link from "next/link";
import { isResetTokenValid } from "@/actions/passwordReset";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function RedefinirSenhaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const valid = await isResetTokenValid(token);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="eyebrow">VendaFácil</span>
          <h1 className="mt-2 font-serif text-3xl font-medium">Redefinir senha</h1>
        </div>

        {valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">
              Esse link é inválido ou já expirou.
            </p>
            <Link
              href="/esqueci-senha"
              className="mt-4 inline-block text-sm text-brand font-medium hover:underline"
            >
              Solicitar um novo link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
