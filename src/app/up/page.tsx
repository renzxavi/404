// src/app/subir/page.tsx
"use client";

import { useState } from "react";
import UploadForm from "@/components/product/UploadForm";
import { PlusCircle } from "lucide-react";

export default function SubirPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-[70dvh] gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <PlusCircle size={28} className="text-muted-foreground" />
      </div>
      <h1 className="font-[family-name:var(--font-syne)] font-bold text-2xl">Subir producto</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        ¿Conocés un producto del exterior que debería llegar a Uruguay? Subilo y veamos cuánta gente lo quiere.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="mt-2 bg-foreground text-background rounded-full px-8 py-3 font-bold text-sm uppercase tracking-widest hover:opacity-80 transition-opacity"
      >
        Agregar producto
      </button>

      {open && <UploadForm onClose={() => setOpen(false)} onSuccess={() => {}} />}
    </div>
  );
}