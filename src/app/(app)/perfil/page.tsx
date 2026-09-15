import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProfileDataForm, EmailForm, PasswordForm } from "./ProfileForms";
import { ThemeSwitch } from "./ThemeSwitch";
import { DangerZone } from "./DangerZone";

export default async function PerfilPage() {
  const user = await requireUser();

  return (
    <div>
      <PageHeader eyebrow="Configuração" title="Perfil" description="Conta, assinatura, preferências e dados da empresa." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle title="Visão geral & assinatura" />
          <div className="flex items-center gap-2 mb-3">
            <Badge tone="brand">Plano {user.planName}</Badge>
            <span className="text-xs text-muted">
              Conta criada em {user.createdAt.toLocaleDateString("pt-BR")}
            </span>
          </div>
          <p className="text-sm text-muted">
            Este é um app auto-hospedado sem cobrança automática — todos os
            recursos estão liberados no seu plano.
          </p>
        </Card>

        <Card>
          <CardTitle title="Configurações" />
          <p className="mb-2 text-sm text-muted">Tema</p>
          <ThemeSwitch current={user.theme} />
        </Card>

        <Card>
          <CardTitle title="Dados pessoais e da empresa" />
          <ProfileDataForm
            name={user.name || ""}
            companyName={user.companyName || ""}
            companyDoc={user.companyDoc || ""}
          />
        </Card>

        <Card className="space-y-6">
          <div>
            <CardTitle title="E-mail" />
            <EmailForm email={user.email} />
          </div>
          <div>
            <CardTitle title="Senha" />
            <PasswordForm />
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle title="Zona de risco" />
        <DangerZone />
      </Card>
    </div>
  );
}
