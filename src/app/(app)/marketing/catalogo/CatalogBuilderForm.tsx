"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { CatalogPreview, type CatalogSettingsLike, type CatalogProductLike } from "@/components/catalog/CatalogPreview";
import type { FormState } from "@/actions/catalog";

export function CatalogBuilderForm({
  action,
  defaults,
  products,
  publicUrl,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults: CatalogSettingsLike & { slug: string };
  products: CatalogProductLike[];
  publicUrl: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [settings, setSettings] = useState<CatalogSettingsLike & { slug: string }>(defaults);
  const [highlightUrl, setHighlightUrl] = useState("");
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  function set<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form action={formAction} className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-base font-semibold">Dados da loja</h3>
          <FieldGroup>
            <Label hint={`vendafacil.app/c/${settings.slug || "sua-loja"}`}>Endereço (slug)</Label>
            <Input
              name="slug"
              value={settings.slug}
              onChange={(e) => set("slug", e.target.value)}
              required
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Título</Label>
            <Input name="title" value={settings.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Descrição</Label>
            <Textarea
              name="description"
              rows={2}
              value={settings.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>WhatsApp</Label>
              <Input
                name="whatsapp"
                placeholder="5511999999999"
                value={settings.whatsapp ?? ""}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup>
              <Label>Instagram</Label>
              <Input
                name="instagram"
                placeholder="@sualoja"
                value={settings.instagram ?? ""}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </FieldGroup>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                checked={settings.active !== false}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Catálogo ativo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showStock"
                checked={settings.showStock}
                onChange={(e) => set("showStock", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Mostrar estoque disponível
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-base font-semibold">Perfil & conteúdo</h3>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>Nome</Label>
              <Input name="name" value={settings.name ?? ""} onChange={(e) => set("name", e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>Profissão</Label>
              <Input
                name="profession"
                value={settings.profession ?? ""}
                onChange={(e) => set("profession", e.target.value)}
              />
            </FieldGroup>
          </div>
          <FieldGroup>
            <Label>Foto de perfil (URL)</Label>
            <Input
              name="profilePhoto"
              value={settings.profilePhoto ?? ""}
              onChange={(e) => set("profilePhoto", e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Banner (URL)</Label>
            <Input name="banner" value={settings.banner ?? ""} onChange={(e) => set("banner", e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <Label>Destaques (estilo Stories)</Label>
            <div className="flex gap-2">
              <Input value={highlightUrl} onChange={(e) => setHighlightUrl(e.target.value)} placeholder="https://…" />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!highlightUrl.trim()) return;
                  set("highlights", [...settings.highlights, highlightUrl.trim()]);
                  setHighlightUrl("");
                }}
              >
                Adicionar
              </Button>
            </div>
            {settings.highlights.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {settings.highlights.map((url, i) => (
                  <span key={i} className="flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 text-xs">
                    Destaque {i + 1}
                    <button
                      type="button"
                      onClick={() => set("highlights", settings.highlights.filter((_, idx) => idx !== i))}
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input type="hidden" name="highlights" value={JSON.stringify(settings.highlights)} />
          </FieldGroup>

          <FieldGroup>
            <Label>FAQ</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input placeholder="Pergunta" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} />
              <Input placeholder="Resposta" value={faqA} onChange={(e) => setFaqA(e.target.value)} />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!faqQ.trim() || !faqA.trim()) return;
                  set("faq", [...settings.faq, { q: faqQ.trim(), a: faqA.trim() }]);
                  setFaqQ("");
                  setFaqA("");
                }}
              >
                Adicionar
              </Button>
            </div>
            {settings.faq.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm">
                {settings.faq.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-1.5">
                    <span className="truncate">{f.q}</span>
                    <button type="button" onClick={() => set("faq", settings.faq.filter((_, idx) => idx !== i))}>
                      <Icon name="X" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input type="hidden" name="faq" value={JSON.stringify(settings.faq)} />
          </FieldGroup>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-base font-semibold">Cores & visual</h3>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label>Fundo</Label>
              <Input type="color" name="background" value={settings.background} onChange={(e) => set("background", e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>Layout</Label>
              <Select name="layout" value={settings.layout} onChange={(e) => set("layout", e.target.value)}>
                <option value="grid">Grade</option>
                <option value="list">Lista</option>
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label>Cor do card</Label>
              <Input type="color" name="cardColor" value={settings.cardColor} onChange={(e) => set("cardColor", e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>Cor do texto</Label>
              <Input type="color" name="textColor" value={settings.textColor} onChange={(e) => set("textColor", e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>Cor do preço</Label>
              <Input type="color" name="priceColor" value={settings.priceColor} onChange={(e) => set("priceColor", e.target.value)} />
            </FieldGroup>
            <FieldGroup>
              <Label>Cor do botão</Label>
              <Input type="color" name="buttonColor" value={settings.buttonColor} onChange={(e) => set("buttonColor", e.target.value)} />
            </FieldGroup>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="removeBranding"
              checked={settings.removeBranding}
              onChange={(e) => set("removeBranding", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Remover marca &quot;VendaFácil&quot; do rodapé
          </label>
        </div>

        {state?.error && <p className="text-sm text-danger bg-danger-soft rounded-lg px-3 py-2">{state.error}</p>}
        {state?.success && <p className="text-sm text-brand-strong bg-brand-soft rounded-lg px-3 py-2">{state.success}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar catálogo"}
          </Button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-brand font-medium hover:underline">
            Ver catálogo público ↗
          </a>
        </div>
      </form>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 text-xs font-medium text-muted">Preview ao vivo</p>
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <CatalogPreview settings={settings} products={products} />
        </div>
      </div>
    </div>
  );
}
