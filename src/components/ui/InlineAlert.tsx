export function InlineAlert({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">{children}</p>
  );
}
