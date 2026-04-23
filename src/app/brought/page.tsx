// src/app/traidos/page.tsx (copiá a src/app/brought/page.tsx)
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";
import { Product } from "@/types/index";
import { ShoppingBag, CheckCircle2, ThumbsUp, ThumbsDown, Bookmark, Shield } from "lucide-react";
import { useAuth } from "@/hook/useAuth";

export default function TraidosPage() {
  const { user } = useAuth();
  const [products, setProducts]   = useState<Product[]>([]);
  const [pending, setPending]     = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [myVotes, setMyVotes]     = useState<Record<string, number>>({});
  const [isAdmin, setIsAdmin]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Siempre cargar importados y países
      const [importedRes, ctrs] = await Promise.all([
        supabase.from("products").select("*").eq("status", 2).order("created_at", { ascending: false }),
        fetchCountries(),
      ]);

      if (importedRes.data) setProducts(importedRes.data as Product[]);
      setCountries(ctrs);

      // Si hay usuario, cargar perfil y votos
      if (user) {
        const [profileRes, votesRes] = await Promise.all([
          supabase.from("profiles").select("role").eq("id", user.id).single(),
          supabase.from("votes").select("product_id, value").eq("user_id", user.id),
        ]);

        if (profileRes.data?.role === "admin") {
          setIsAdmin(true);
          const pendingRes = await supabase
            .from("products")
            .select("*")
            .eq("status", 1)
            .order("demand", { ascending: false });
          if (pendingRes.data) setPending(pendingRes.data as Product[]);
        }

        if (votesRes.data) {
          const map: Record<string, number> = {};
          votesRes.data.forEach((v: { product_id: string; value: number }) => {
            map[v.product_id] = v.value;
          });
          setMyVotes(map);
        }
      }

      setLoading(false);
    }
    load();
  }, [user]);

  async function approveImport(productId: string) {
    setApproving(productId);
    await supabase.from("imports").insert({
      product_id: productId,
      marked_by: user!.id,
    });
    const product = pending.find(p => p.id === productId);
    if (product) {
      setPending(prev => prev.filter(p => p.id !== productId));
      setProducts(prev => [{ ...product, status: 2 }, ...prev]);
    }
    setApproving(null);
  }

  function getCountry(code: string) {
    return countries.find((c) => c.code === code);
  }

  function voteBadge(productId: string) {
    const v = myVotes[productId];
    if (v === 1)  return { text: "Voté quiero",   cls: "bg-green-100 text-green-700", icon: <ThumbsUp size={10} /> };
    if (v === 2)  return { text: "Lo necesitaba", cls: "bg-blue-100 text-blue-700",   icon: <Bookmark size={10} /> };
    if (v === -1) return { text: "Voté paso",     cls: "bg-red-100 text-red-600",     icon: <ThumbsDown size={10} /> };
    return null;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border shrink-0">
        <ShoppingBag size={18} />
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-lg">Traídos</h1>
        <span className="ml-auto text-xs text-muted-foreground">Importados a Uruguay</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-6 max-w-sm mx-auto">

          {/* PANEL ADMIN */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-[var(--color-brand)]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">
                  Admin — Aprobar ({pending.length})
                </h2>
              </div>
              {pending.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No hay productos pendientes.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {pending.map((p) => {
                    const country = getCountry(p.country);
                    return (
                      <div key={p.id} className="bg-card rounded-2xl p-3 flex items-center gap-3 border-2 border-[var(--color-brand)]/20">
                        <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: p.image_color }}>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                            : <span>📦</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {country?.flag} {country?.name ?? p.country} · {Math.round(p.demand)}% demanda
                          </p>
                        </div>
                        <button
                          onClick={() => approveImport(p.id)}
                          disabled={approving === p.id}
                          className="shrink-0 flex items-center gap-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {approving === p.id ? "..." : <><CheckCircle2 size={11} /> Aprobar</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LISTA IMPORTADOS */}
          <div>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <CheckCircle2 size={32} className="text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">Todavía no hay productos importados.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {products.map((p) => {
                  const country = getCountry(p.country);
                  const badge   = user ? voteBadge(p.id) : null;
                  return (
                    <div key={p.id} className="bg-card rounded-2xl p-3 flex items-center gap-3 border border-border">
                      <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: p.image_color }}>
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                          : <span>📦</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {country?.flag} {country?.name ?? p.country} · {p.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <CheckCircle2 size={16} className="text-green-500" />
                        {badge && (
                          <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.icon} {badge.text}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}