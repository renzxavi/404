// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import { ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hook/useAuth";

const TYPES = [
  { value: "edit_product",   label: "Editar producto" },
  { value: "delete_product", label: "Borrar producto" },
  { value: "product_exists", label: "Producto ya existe" },
  { value: "other",          label: "Otro" },
];

export default function ContactoPage() {
  const { user } = useAuth();
  const [type, setType]       = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail]     = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit() {
    if (!type || !message) { setError("Completá el tipo y el mensaje"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("contacts").insert({
      type,
      message,
      email: email || null,
      user_id: user?.id ?? null,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  if (sent) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
      <CheckCircle2 size={48} className="text-green-500" />
      <div>
        <h2 className="font-[family-name:var(--font-syne)] font-bold text-xl mb-1">¡Mensaje enviado!</h2>
        <p className="text-sm text-muted-foreground">Te respondemos a la brevedad.</p>
      </div>
      <button
        onClick={() => { setSent(false); setType(""); setMessage(""); }}
        className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        Enviar otro
      </button>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-sm mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-2xl mb-8">Contacto</h1>

        <div className="flex flex-col gap-5">
          {/* Tipo */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Tipo <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-foreground/10 appearance-none cursor-pointer"
              >
                <option value="">Seleccioná un tipo...</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Mensaje <span className="text-destructive">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribí tu mensaje..."
              rows={5}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-foreground/10 resize-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Tu email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="para poder responderte"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>

          {error && <p className="text-xs text-destructive text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-foreground text-background font-bold uppercase tracking-widest py-4 text-sm hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : "Enviar mensaje"}
          </button>
        </div>
      </div>
    </div>
  );
}