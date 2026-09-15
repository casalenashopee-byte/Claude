export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="font-serif text-2xl font-medium">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted max-w-xl">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
