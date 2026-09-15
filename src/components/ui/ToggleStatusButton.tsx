"use client";

import { Badge } from "./Badge";

export function ToggleStatusButton({
  action,
  id,
  active,
}: {
  action: (formData: FormData) => void;
  id: string;
  active: boolean;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="cursor-pointer">
        <Badge tone={active ? "brand" : "neutral"}>
          {active ? "Ativo" : "Inativo"}
        </Badge>
      </button>
    </form>
  );
}
