import { formatBRL } from "@/lib/calc";

export type CatalogSettingsLike = {
  title?: string | null;
  description?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  active?: boolean;
  showStock: boolean;
  layout: string;
  background: string;
  cardColor: string;
  textColor: string;
  priceColor: string;
  buttonColor: string;
  profilePhoto?: string | null;
  name?: string | null;
  profession?: string | null;
  banner?: string | null;
  highlights: string[];
  faq: { q: string; a: string }[];
  removeBranding: boolean;
};

export type CatalogProductLike = {
  id: string;
  name: string;
  retailPrice: number;
  images: string[];
  stockQty: number;
  type: string;
};

export function CatalogPreview({
  settings,
  products,
}: {
  settings: CatalogSettingsLike;
  products: CatalogProductLike[];
}) {
  return (
    <div style={{ background: settings.background, color: settings.textColor }} className="min-h-full">
      {settings.banner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings.banner} alt="" className="h-32 w-full object-cover sm:h-48" />
      )}

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-3">
          {settings.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.profilePhoto}
              alt=""
              className="h-14 w-14 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-black/10" />
          )}
          <div>
            <p className="font-serif text-lg font-medium">{settings.name || settings.title || "Meu catálogo"}</p>
            {settings.profession && <p className="text-xs opacity-70">{settings.profession}</p>}
          </div>
        </div>

        {settings.description && <p className="mt-3 text-sm opacity-80">{settings.description}</p>}

        {settings.highlights.length > 0 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {settings.highlights.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full object-cover border-2"
                style={{ borderColor: settings.buttonColor }}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: settings.buttonColor }}
            >
              WhatsApp
            </a>
          )}
          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: settings.buttonColor, color: settings.buttonColor }}
            >
              @{settings.instagram.replace(/^@/, "")}
            </a>
          )}
        </div>

        <div
          className={
            settings.layout === "list"
              ? "mt-6 space-y-3"
              : "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"
          }
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{ background: settings.cardColor }}
              className={
                settings.layout === "list"
                  ? "flex items-center gap-3 rounded-xl p-2 shadow-sm"
                  : "rounded-xl p-2 shadow-sm"
              }
            >
              <div
                className={
                  settings.layout === "list"
                    ? "h-16 w-16 shrink-0 rounded-lg bg-black/5 overflow-hidden"
                    : "aspect-square w-full rounded-lg bg-black/5 overflow-hidden"
                }
              >
                {p.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className={settings.layout === "list" ? "" : "mt-2"}>
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-sm font-semibold" style={{ color: settings.priceColor }}>
                  {formatBRL(p.retailPrice)}
                </p>
                {settings.showStock && p.type === "FISICO" && (
                  <p className="text-xs opacity-60">
                    {p.stockQty > 0 ? `${p.stockQty} em estoque` : "Sem estoque"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {settings.faq.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Perguntas frequentes</p>
            {settings.faq.map((f, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: settings.cardColor }}>
                <p className="text-sm font-medium">{f.q}</p>
                <p className="text-sm opacity-70">{f.a}</p>
              </div>
            ))}
          </div>
        )}

        {!settings.removeBranding && (
          <p className="mt-8 text-center text-xs opacity-50">Catálogo criado com VendaFácil</p>
        )}
      </div>
    </div>
  );
}
