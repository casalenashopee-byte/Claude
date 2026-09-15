"use client";

import { useRef, useState } from "react";
import { Button } from "./Button";
import { fileToDataUrl, MAX_IMAGE_INPUT_MB } from "@/lib/image";

export function ImageUploadButton({
  label = "Adicionar foto",
  multiple = false,
  onPick,
}: {
  label?: string;
  multiple?: boolean;
  onPick: (dataUrls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (files.length === 0) return;

    const tooBig = files.find((f) => f.size > MAX_IMAGE_INPUT_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" é maior que ${MAX_IMAGE_INPUT_MB}MB.`);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const dataUrls = await Promise.all(files.map((f) => fileToDataUrl(f)));
      onPick(dataUrls);
    } catch {
      setError("Não foi possível processar a imagem. Tente outro arquivo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Processando…" : label}
      </Button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
