import { PageHeader } from "@/components/ui/PageHeader";
import { createCustomerAction } from "@/actions/customers";
import { CustomerForm } from "../CustomerForm";

export default function NovoClientePage() {
  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Novo cliente" />
      <CustomerForm action={createCustomerAction} />
    </div>
  );
}
