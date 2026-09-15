"use client";

import { Icon } from "./Icon";

export function DeleteButton({
  action,
  id,
  confirmMessage = "Tem certeza que deseja excluir? Essa ação não pode ser desfeita.",
}: {
  action: (formData: FormData) => void;
  id: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger transition-colors"
        aria-label="Excluir"
        title="Excluir"
      >
        <Icon name="Trash2" size={16} />
      </button>
    </form>
  );
}
