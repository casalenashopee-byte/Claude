"use client";

import { useEffect, useMemo, useState } from "react";
import { formatBRL, round2 } from "@/lib/calc";

type Product = {
  id: string;
  name: string;
  retailPrice: number;
  images: string[];
  stockQty: number;
  type: string;
};

type Coupon = { code: string; type: "percent" | "fixed"; value: number; active: boolean };
type Section = { key: string; enabled: boolean };

export function StoreClient({
  slug,
  storeName,
  whatsapp,
  banner,
  background,
  products,
  sections,
  shippingFixed,
  paymentInfo,
  coupons,
  termsText,
}: {
  slug: string;
  storeName: string;
  whatsapp: string | null;
  banner: string | null;
  background: string;
  products: Product[];
  sections: Section[];
  shippingFixed: number | null;
  paymentInfo: string | null;
  coupons: Coupon[];
  termsText: string | null;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(!termsText);
  const [cartOpen, setCartOpen] = useState(false);

  const storageKey = `vf_cart_${slug}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- carrega estado externo (localStorage) uma vez no mount
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* ignora */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      /* ignora */
    }
  }, [cart, storageKey]);

  const isEnabled = (key: string) => sections.find((s) => s.key === key)?.enabled ?? true;

  const filtered = useMemo(
    () =>
      search
        ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : products,
    [products, search]
  );

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((i): i is { product: Product; qty: number } => !!i.product && i.qty > 0),
    [cart, products]
  );

  const subtotal = round2(cartItems.reduce((s, i) => s + i.product.retailPrice * i.qty, 0));
  const discount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? round2((subtotal * appliedCoupon.value) / 100)
      : Math.min(appliedCoupon.value, subtotal)
    : 0;
  const total = round2(Math.max(subtotal - discount, 0) + (shippingFixed || 0));

  function addToCart(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setCartOpen(true);
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => ({ ...prev, [id]: Math.max(qty, 0) }));
  }

  function applyCoupon() {
    const found = coupons.find((c) => c.active && c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!found) {
      setCouponError("Cupom inválido.");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    setCouponError("");
  }

  function checkout() {
    if (!whatsapp) return;
    if (termsText && !termsAccepted) return;

    const lines = [
      `Pedido — ${storeName}`,
      "",
      ...cartItems.map((i) => `${i.qty}x ${i.product.name} — ${formatBRL(i.product.retailPrice * i.qty)}`),
      "",
      `Subtotal: ${formatBRL(subtotal)}`,
      ...(discount > 0 ? [`Desconto (${appliedCoupon?.code}): -${formatBRL(discount)}`] : []),
      ...(shippingFixed ? [`Frete: ${formatBRL(shippingFixed)}`] : ["Frete: a combinar"]),
      `Total: ${formatBRL(total)}`,
    ];

    const url = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  }

  return (
    <div style={{ background }} className="min-h-screen">
      {isEnabled("anuncio") && (
        <div className="bg-brand py-1.5 text-center text-xs font-medium text-white">
          Compre agora e fale direto com a gente pelo WhatsApp
        </div>
      )}

      {isEnabled("banner") && banner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner} alt="" className="h-32 w-full object-cover sm:h-56" />
      )}

      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <h1 className="font-serif text-xl font-medium">{storeName}</h1>
        <button
          onClick={() => setCartOpen(true)}
          className="relative rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          Carrinho {cartItems.length > 0 && `(${cartItems.reduce((s, i) => s + i.qty, 0)})`}
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {isEnabled("busca") && (
          <input
            placeholder="Buscar produto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        )}

        {isEnabled("confianca") && (
          <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted">
            <span>✓ Compra segura</span>
            <span>✓ Atendimento direto pelo WhatsApp</span>
            {paymentInfo && <span>✓ {paymentInfo}</span>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-surface p-2">
              <div className="aspect-square overflow-hidden rounded-lg bg-surface-muted">
                {p.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <p className="mt-2 text-sm font-medium truncate">{p.name}</p>
              <p className="text-sm font-semibold text-brand-strong">{formatBRL(p.retailPrice)}</p>
              <button
                onClick={() => addToCart(p.id)}
                className="mt-2 w-full rounded-lg bg-brand py-1.5 text-xs font-medium text-white"
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">Nenhum produto encontrado.</p>
        )}
      </main>

      {isEnabled("rodape") && (
        <footer className="border-t border-border py-8 text-center text-xs text-muted">
          <p>{storeName} · Loja criada com VendaFácil</p>
        </footer>
      )}

      {isEnabled("whatsapp") && whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-4 right-4 rounded-full bg-brand p-3.5 text-white shadow-lg"
        >
          WhatsApp
        </a>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative flex h-full w-full max-w-sm flex-col bg-surface p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seu carrinho</h2>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
              {cartItems.length === 0 && <p className="text-sm text-muted">Carrinho vazio.</p>}
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex-1 truncate">{product.name}</span>
                  <input
                    type="number"
                    min={0}
                    value={qty}
                    onChange={(e) => setQty(product.id, parseInt(e.target.value, 10) || 0)}
                    className="w-14 rounded-lg border border-border px-2 py-1 text-center"
                  />
                  <span className="w-20 text-right font-medium">
                    {formatBRL(product.retailPrice * qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <input
                  placeholder="Cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-lg border border-border px-2 py-1.5"
                />
                <button onClick={applyCoupon} className="rounded-lg border border-border px-3 text-xs font-medium">
                  Aplicar
                </button>
              </div>
              {couponError && <p className="text-xs text-danger">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-xs text-brand-strong">Cupom {appliedCoupon.code} aplicado.</p>
              )}

              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-strong">
                  <span>Desconto</span>
                  <span>-{formatBRL(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Frete</span>
                <span>{shippingFixed ? formatBRL(shippingFixed) : "A combinar"}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </div>

              {termsText && (
                <label className="flex items-start gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5"
                  />
                  Li e aceito os termos: {termsText}
                </label>
              )}

              <button
                onClick={checkout}
                disabled={cartItems.length === 0 || !whatsapp || (!!termsText && !termsAccepted)}
                className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Finalizar pelo WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
