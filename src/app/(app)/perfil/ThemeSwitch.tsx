"use client";

import clsx from "clsx";
import { toggleThemeAction } from "@/actions/profile";

export function ThemeSwitch({ current }: { current: string }) {
  return (
    <div className="flex gap-2">
      {(["light", "dark"] as const).map((t) => (
        <button
          key={t}
          onClick={() => {
            document.documentElement.classList.toggle("dark", t === "dark");
            toggleThemeAction(t);
          }}
          className={clsx(
            "rounded-lg border px-4 py-2 text-sm font-medium",
            current === t ? "border-brand bg-brand-soft text-brand-strong" : "border-border hover:bg-surface-muted"
          )}
        >
          {t === "light" ? "Claro" : "Escuro"}
        </button>
      ))}
    </div>
  );
}
