import Link from "next/link";
import clsx from "clsx";

export const PAGE_SIZE = 20;

export function paginationSkip(page: number) {
  return Math.max(page - 1, 0) * PAGE_SIZE;
}

export function Pagination({
  page,
  total,
  buildHref,
}: {
  page: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-muted">
        {total} {total === 1 ? "registro" : "registros"} · página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={buildHref(Math.max(page - 1, 1))}
          aria-disabled={prevDisabled}
          className={clsx(
            "rounded-lg border border-border px-3 py-1.5 font-medium",
            prevDisabled ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
          )}
        >
          Anterior
        </Link>
        <Link
          href={buildHref(Math.min(page + 1, totalPages))}
          aria-disabled={nextDisabled}
          className={clsx(
            "rounded-lg border border-border px-3 py-1.5 font-medium",
            nextDisabled ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
          )}
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}
