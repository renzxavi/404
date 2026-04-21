// src/components/layout/CategoryTabs.tsx
"use client";

import { useState } from "react";
import { MinusCircle, PauseCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "no-camina", label: "Acá no camina",  icon: MinusCircle },
  { id: "necesito",  label: "Lo necesito acá", icon: PauseCircle },
  { id: "no-existe", label: "Cómo no existe",  icon: XCircle },
];

export default function CategoryTabs() {
  const [active, setActive] = useState("no-camina");
  return (
    <div className="grid grid-cols-3 border-b border-border bg-background">
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={cn(
            "flex items-center justify-center gap-2 py-3 text-xs font-medium uppercase tracking-wider transition-colors border-r border-border last:border-r-0",
            active === id
              ? "text-foreground border-b-2 border-b-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon size={14} strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}