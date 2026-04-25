// src/components/auth/AuthModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, MapPin, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab]             = useState<"login" | "register">("login");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [country, setCountry]     = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingC, setLoadingC]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    setLoadingC(true);
    fetchCountries().then(setCountries).finally(() => setLoadingC(false));
  }, []);

  async function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
      const data = await res.json();
      const code = data.address?.country_code?.toUpperCase();
      if (code) setCountry(code);
    });
  }

  async function handleSubmit() {
    setError("");
    if (!email) { setError("El email es obligatorio"); return; }
    if (!password) { setError("La contraseña es obligatoria"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    if (tab === "register" && !country) { setError("Seleccioná tu país"); return; }

    setLoading(true);
    try {
      if (tab === "register") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { country } } });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error inesperado";
      // Traducir errores comunes de Supabase
      if (msg.includes("Invalid login credentials")) setError("Email o contraseña incorrectos");
      else if (msg.includes("Email not confirmed")) setError("Confirmá tu email antes de ingresar");
      else if (msg.includes("User already registered")) setError("Ya existe una cuenta con ese email");
      else if (msg.includes("Password should be")) setError("La contraseña debe tener al menos 6 caracteres");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = "w-full rounded-2xl border-[2.5px] border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-black/5 transition-all placeholder:text-black/30";
  const labelStyle = "text-[9px] font-black uppercase tracking-widest mb-2 block";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Sombra */}
        <div className="absolute inset-0 rounded-[32px] bg-black" style={{ translate: "6px 6px" }} />

        <div className="relative bg-white rounded-[32px] border-[3px] border-black overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b-[3px] border-black">
            <span style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 900, fontSize: "20px", letterSpacing: "-0.03em" }}>
              404<span style={{ color: "#4a90e2" }}>.</span>
            </span>
            <button onClick={onClose} className="w-9 h-9 rounded-full border-[2.5px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-all">
              <X size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-[3px] border-black">
            {(["login", "register"] as const).map((t, i) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all"
                style={{
                  backgroundColor: tab === t ? "#1a1a1a" : "transparent",
                  color: tab === t ? "#ffffff" : "#1a1a1a",
                  borderRight: i === 0 ? "3px solid black" : "none",
                }}
              >
                {t === "login" ? "Ingresar" : "Registrarse"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" className={inputStyle} />
            </div>

            <div>
              <label className={labelStyle}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={inputStyle} />
            </div>

            {tab === "register" && (
              <div>
                <label className={labelStyle}>Tu País <span className="text-[#FF3CAC]">*</span></label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select value={country} onChange={(e) => setCountry(e.target.value)}
                      disabled={loadingC}
                      className={`${inputStyle} appearance-none pr-8 disabled:opacity-50 cursor-pointer`}>
                      <option value="">Seleccionar...</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} strokeWidth={3} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button onClick={detectLocation}
                    className="w-11 h-11 rounded-full border-[2.5px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-all shrink-0">
                    <MapPin size={15} strokeWidth={2.5} style={{ color: "#4a90e2" }} />
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="border-[2.5px] border-[#FF3CAC] bg-[#FF3CAC]/10 p-3 rounded-2xl">
                <p className="text-xs font-black text-[#FF3CAC] text-center uppercase tracking-wider">{error}</p>
              </div>
            )}

            {/* Botón */}
            <div className="relative mt-1">
              <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "4px 4px" }} />
              <button onClick={handleSubmit} disabled={loading}
                className="relative w-full rounded-2xl py-4 text-sm font-black uppercase tracking-[0.2em] disabled:opacity-50 transition-all border-[2.5px] border-black"
                style={{ backgroundColor: "#4a90e2", color: "#ffffff" }}>
                {loading ? "..." : tab === "register" ? "Crear cuenta" : "Ingresar"}
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}