"use client";

import { useState, useTransition } from "react";
import { logoutAction } from "@/actions/auth";
import { toggleThemeAction } from "@/actions/profile";
import { Icon } from "@/components/ui/Icon";
import { Sidebar } from "./Sidebar";

export function Topbar({
  companyName,
  theme,
}: {
  companyName: string;
  theme: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(theme === "dark");
  const [, startTransition] = useTransition();

  function handleToggleTheme() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", next === "dark");
    startTransition(() => {
      toggleThemeAction(next);
    });
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            className="md:hidden rounded-lg p-2 hover:bg-surface-muted"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Icon name="Menu" size={20} />
          </button>
          <span className="font-serif text-lg font-medium truncate max-w-[50vw]">
            {companyName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleTheme}
            className="rounded-lg p-2 hover:bg-surface-muted text-muted"
            aria-label="Alternar tema"
            title="Alternar tema claro/escuro"
          >
            <Icon name={isDark ? "Sun" : "Moon"} size={18} />
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg p-2 hover:bg-surface-muted text-muted"
              aria-label="Sair"
              title="Sair"
            >
              <Icon name="LogOut" size={18} />
            </button>
          </form>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface border-r border-border shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-serif font-medium">VendaFácil</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 hover:bg-surface-muted"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
