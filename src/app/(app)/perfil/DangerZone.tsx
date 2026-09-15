"use client";

import { clearMyDataAction, deleteAccountAction } from "@/actions/profile";
import { Button } from "@/components/ui/Button";

export function DangerZone() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Limpar meus dados</p>
          <p className="text-xs text-muted">
            Apaga vendas, produtos, clientes e financeiro — mantém sua conta e plano.
          </p>
        </div>
        <form
          action={clearMyDataAction}
          onSubmit={(e) => {
            if (!confirm("Isso vai apagar todos os seus dados operacionais (produtos, vendas, financeiro…). Sua conta continua ativa. Confirmar?")) {
              e.preventDefault();
            }
          }}
        >
          <Button type="submit" variant="secondary" size="sm">
            Limpar dados
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger-soft p-3">
        <div>
          <p className="text-sm font-medium text-danger">Excluir minha conta</p>
          <p className="text-xs text-danger/80">Apaga tudo permanentemente. Não pode ser desfeito.</p>
        </div>
        <form
          action={deleteAccountAction}
          onSubmit={(e) => {
            if (!confirm("Tem certeza? Sua conta e TODOS os dados serão apagados permanentemente.")) {
              e.preventDefault();
            }
          }}
        >
          <Button type="submit" variant="danger" size="sm">
            Excluir conta
          </Button>
        </form>
      </div>
    </div>
  );
}
