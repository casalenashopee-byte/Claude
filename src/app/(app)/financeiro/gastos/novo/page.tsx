import { PageHeader } from "@/components/ui/PageHeader";
import { createExpenseAction } from "@/actions/expenses";
import { ExpenseForm } from "./ExpenseForm";

export default function NovoGastoPage() {
  return (
    <div>
      <PageHeader eyebrow="Financeiro" title="Novo gasto" />
      <ExpenseForm action={createExpenseAction} />
    </div>
  );
}
