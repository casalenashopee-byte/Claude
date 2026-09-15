import { PageHeader } from "@/components/ui/PageHeader";
import { createCashEntryAction } from "@/actions/cashEntries";
import { CashEntryForm } from "./CashEntryForm";

export default function NovoLancamentoPage() {
  return (
    <div>
      <PageHeader eyebrow="Financeiro" title="Novo lançamento" />
      <CashEntryForm action={createCashEntryAction} />
    </div>
  );
}
