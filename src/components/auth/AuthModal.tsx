// src/components/auth/AuthModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountries, setShowCountries] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingCountries(true);
    fetchCountries()
      .then(setCountries)
      .finally(() => setLoadingCountries(false));
  }, []);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  async function detectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
      );
      const data = await res.json();
      const code = data.address?.country_code?.toUpperCase();
      const found = countries.find((c) => c.code === code);
      if (found) { setCountry(found.code); setCountrySearch(found.name); }
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      if (tab === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { country } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-background w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-2xl">Cuenta</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-full border border-border p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-widest transition-colors",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {t === "login" ? "Ingresar" : "Registrarse"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>

          {/* País (solo register) */}
          {tab === "register" && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Tu País</label>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => { setCountrySearch(e.target.value); setShowCountries(true); }}
                  onFocus={() => setShowCountries(true)}
                  placeholder={loadingCountries ? "Cargando países..." : "Buscar país..."}
                  disabled={loadingCountries}
                  className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all disabled:opacity-50"
                />
                <button
                  onClick={detectLocation}
                  className="w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                >
                  <MapPin size={16} className="text-[var(--color-brand)]" />
                </button>

                {showCountries && filtered.length > 0 && (
                  <div className="absolute top-full left-0 right-12 mt-1 bg-card border border-border rounded-2xl shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filtered.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCountry(c.code); setCountrySearch(c.name); setShowCountries(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                      >
                        <span>{c.flag}</span> {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-foreground text-background font-bold uppercase tracking-widest py-4 text-sm hover:opacity-80 transition-opacity disabled:opacity-50 mt-1"
          >
            {loading ? "..." : tab === "register" ? "Crear cuenta" : "Ingresar"}
          </button>

          {tab === "register" && (
            <p className="text-center text-xs text-muted-foreground">
              Sin cuenta, tu voto cuenta con peso reducido (0.3×).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}