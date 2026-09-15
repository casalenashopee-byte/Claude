import { LinkButton } from "./Button";

/** Tela vazia sempre com um próximo passo — nunca um beco sem saída. */
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-border bg-surface-muted/50">
      {icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      )}
      {actionLabel && actionHref && (
        <LinkButton href={actionHref} className="mt-4">
          {actionLabel}
        </LinkButton>
      )}
    </div>
  );
}
