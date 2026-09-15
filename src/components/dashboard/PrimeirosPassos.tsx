"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";

const STORAGE_KEY = "vf_primeiros_passos_dismissed";

const STEPS = [
  { key: "hasProduct" as const, label: "Cadastrar um produto", href: "/produtos/novo" },
  { key: "hasSale" as const, label: "Registrar uma venda", href: "/vendas/nova" },
  { key: "hasCatalog" as const, label: "Criar um catálogo público", href: "/marketing/catalogo" },
];

export function PrimeirosPassos({
  steps,
}: {
  steps: { hasProduct: boolean; hasSale: boolean; hasCatalog: boolean };
}) {
  const [dismissed, setDismissed] = useState(true);
  const allDone = STEPS.every((s) => steps[s.key]);

  useEffect(() => {
    if (allDone) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê estado externo (localStorage) uma vez no mount
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, [allDone]);

  if (allDone || dismissed) return null;

  return (
    <div className="mb-6 rounded-2xl border border-brand/30 bg-brand-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-brand-strong">Primeiros passos</p>
        <button
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              /* ignora ambientes sem storage */
            }
          }}
          className="text-brand-strong/70 hover:text-brand-strong"
          aria-label="Dispensar"
        >
          <Icon name="X" size={16} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {STEPS.map((step) => {
          const done = steps[step.key];
          return (
            <Link
              key={step.key}
              href={step.href}
              className={clsx(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                done
                  ? "border-brand/40 bg-surface text-muted line-through"
                  : "border-brand bg-surface text-brand-strong hover:bg-brand-soft"
              )}
            >
              <Icon name={done ? "CheckCircle2" : "Circle"} size={15} />
              {step.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
