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

const inputStyle = "w-full rounded-2xl border-[2.5px] border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-black/5 transition-all placeholder:text-black/30";
const labelStyle = "text-[9px] font-black uppercase tracking-widest mb-2 block";

export default function ContactPage() {
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
      type, message, email: email || null, user_id: user?.id ?? null,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  if (sent) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-black" style={{ translate: "4px 4px" }} />
        <div className="relative w-16 h-16 rounded-full border-[3px] border-black bg-[#C8F000] flex items-center justify-center">
          <CheckCircle2 size={28} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <h2 className="font-[family-name:var(--font-syne)] font-black text-xl mb-1 uppercase tracking-tighter">¡Mensaje enviado!</h2>
        <p className="text-xs font-bold text-black/50 uppercase tracking-wider">Te respondemos a la brevedad.</p>
      </div>
      <div className="relative mt-2">
        <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
        <button onClick={() => { setSent(false); setType(""); setMessage(""); }}
          className="relative border-[2.5px] border-black rounded-2xl px-6 py-2.5 text-[9px] font-black uppercase tracking-widest bg-white hover:bg-black/5 transition-colors">
          Enviar otro
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto flex items-start justify-center px-4 py-6">
      <div className="relative w-full max-w-sm">
        <div className="absolute inset-0 rounded-[32px] bg-black" style={{ translate: "6px 6px" }} />
        <div className="relative bg-white rounded-[32px] border-[3px] border-black overflow-hidden">
          {/* Header */}

          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Tipo */}
            <div>
              <label className={labelStyle}>Tipo <span className="text-[#FF3CAC]">*</span></label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className={`${inputStyle} appearance-none cursor-pointer pr-8`}>
                  <option value="">Seleccioná un tipo...</option>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={16} strokeWidth={3} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Mensaje */}
            <div>
              <label className={labelStyle}>Mensaje <span className="text-[#FF3CAC]">*</span></label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribí tu mensaje..." rows={5}
                className={`${inputStyle} resize-none`} />
            </div>

            {/* Email */}
            <div>
              <label className={labelStyle}>Tu email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="para poder responderte" className={inputStyle} />
            </div>

            {error && (
              <div className="border-[2.5px] border-[#FF3CAC] bg-[#FF3CAC]/10 p-3 rounded-2xl">
                <p className="text-xs font-black text-[#FF3CAC] text-center uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="relative mt-1">
              <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "4px 4px" }} />
              <button onClick={handleSubmit} disabled={loading}
                className="relative w-full rounded-2xl bg-black text-white py-4 text-[9px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 border-[2.5px] border-black">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Enviando...</> : "Enviar mensaje"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}