import Link from "next/link";
import clsx from "clsx";
import { periodLabel, type PeriodKey } from "@/lib/dateRange";

const KEYS: PeriodKey[] = ["hoje", "7d", "30d", "mes", "3m", "6m", "12m"];

export function PeriodFilter({ basePath, current }: { basePath: string; current: PeriodKey }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {KEYS.map((key) => (
        <Link
          key={key}
          href={`${basePath}?p=${key}`}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            current === key
              ? "border-brand bg-brand-soft text-brand-strong"
              : "border-border text-muted hover:bg-surface-muted"
          )}
        >
          {periodLabel(key)}
        </Link>
      ))}
    </div>
  );
}
