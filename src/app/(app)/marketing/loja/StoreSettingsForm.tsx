"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import type { FormState } from "@/actions/store";

type Section = { key: string; enabled: boolean; order: number };
type Coupon = { code: string; type: "percent" | "fixed"; value: number; active: boolean };

const SECTION_LABELS: Record<string, string> = {
  anuncio: "Barra de anúncio",
  banner: "Banner hero",
  busca: "Busca",
  categorias: "Filtro de categorias",
  confianca: "Barra de confiança",
  destaques: "Destaques",
  rodape: "Rodapé completo",
  whatsapp: "Botão flutuante do WhatsApp",
};

export function StoreSettingsForm({
  action,
  defaults,
  publicUrl,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults: {
    active: boolean;
    sections: Section[];
    shippingFixed: number | null;
    paymentInfo: string | null;
    coupons: Coupon[];
    termsText: string | null;
  };
  publicUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [sections, setSections] = useState(defaults.sections);
  const [coupons, setCoupons] = useState(defaults.coupons);
  const [couponCode, setCouponCode] = useState("");
  const [couponValue, setCouponValue] = useState("10");
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [hasShipping, setHasShipping] = useState(defaults.shippingFixed !== null);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Status</h3>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-brand font-medium hover:underline">
              Ver loja pública ↗
            </a>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={defaults.active} className="h-4 w-4 rounded border-border" />
          Loja ativa
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
        <h3 className="text-base font-semibold">Seções</h3>
        <p className="text-sm text-muted">Ligue/desligue individualmente cada bloco da loja.</p>
        <div className="space-y-2">
          {sections.map((s, i) => (
            <label key={s.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              {SECTION_LABELS[s.key] || s.key}
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) =>
                  setSections((prev) => prev.map((x, idx) => (idx === i ? { ...x, enabled: e.target.checked } : x)))
                }
                className="h-4 w-4 rounded border-border"
              />
            </label>
          ))}
        </div>
        <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <h3 className="text-base font-semibold">Frete & pagamento</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasShipping}
            onChange={(e) => setHasShipping(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Frete fixo (senão, &quot;a entrega é combinada no contato&quot;)
        </label>
        {hasShipping && (
          <FieldGroup>
            <Label>Valor do frete (R$)</Label>
            <Input type="number" step="0.01" min="0" name="shippingFixed" defaultValue={defaults.shippingFixed ?? 0} className="w-40" />
          </FieldGroup>
        )}
        <FieldGroup>
          <Label hint="pagamento fecha por WhatsApp, isso é só informativo">Formas de pagamento aceitas</Label>
          <Textarea name="paymentInfo" rows={2} defaultValue={defaults.paymentInfo ?? ""} placeholder="Ex: PIX, cartão na entrega, dinheiro" />
        </FieldGroup>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
        <h3 className="text-base font-semibold">Cupons</h3>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="CÓDIGO" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="w-32" />
          <Select value={couponType} onChange={(e) => setCouponType(e.target.value as typeof couponType)} className="w-32">
            <option value="percent">% desconto</option>
            <option value="fixed">R$ fixo</option>
          </Select>
          <Input type="number" step="0.01" value={couponValue} onChange={(e) => setCouponValue(e.target.value)} className="w-28" />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!couponCode.trim()) return;
              setCoupons((prev) => [
                ...prev,
                { code: couponCode.trim(), type: couponType, value: parseFloat(couponValue) || 0, active: true },
              ]);
              setCouponCode("");
            }}
          >
            Adicionar
          </Button>
        </div>
        {coupons.length > 0 && (
          <ul className="space-y-1">
            {coupons.map((c, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-1.5 text-sm">
                <span>
                  <strong>{c.code}</strong> — {c.type === "percent" ? `${c.value}%` : `R$ ${c.value}`}
                </span>
                <button type="button" onClick={() => setCoupons((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Icon name="X" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input type="hidden" name="coupons" value={JSON.stringify(coupons)} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
        <FieldGroup>
          <Label>Termos da loja</Label>
          <Textarea name="termsText" rows={3} defaultValue={defaults.termsText ?? ""} placeholder="Trocas, garantia, prazos…" />
        </FieldGroup>
      </div>

      {state?.error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-brand-strong bg-brand-soft rounded-lg px-3 py-2">{state.success}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar loja"}
      </Button>
    </form>
  );
}
