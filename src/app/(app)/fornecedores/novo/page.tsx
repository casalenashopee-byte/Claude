import { PageHeader } from "@/components/ui/PageHeader";
import { createSupplierAction } from "@/actions/suppliers";
import { SupplierForm } from "../SupplierForm";

export default function NovoFornecedorPage() {
  return (
    <div>
      <PageHeader eyebrow="Cadastro" title="Novo fornecedor" />
      <SupplierForm action={createSupplierAction} />
    </div>
  );
}
