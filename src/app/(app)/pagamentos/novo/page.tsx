import { PageHeader } from "@/components/ui/PageHeader";
import { createPaymentMethodAction } from "@/actions/paymentMethods";
import { PaymentMethodForm } from "../PaymentMethodForm";

export default function NovaFormaPagamentoPage() {
  return (
    <div>
      <PageHeader eyebrow="Menu principal" title="Nova forma de pagamento" />
      <PaymentMethodForm action={createPaymentMethodAction} />
    </div>
  );
}
