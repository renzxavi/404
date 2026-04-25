// src/app/ranking/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";
import { Product } from "@/types/index";
import { getCategoryColor } from "@/lib/categories";

interface ProductWithDelta extends Product {
  delta: number | null;
  demand_live: number;
  top_label: string;
  top_pct: number;
}

export default function RankingPage() {
  const [products, setProducts]   = useState<ProductWithDelta[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDate = yesterday.toISOString().split("T")[0];

      const [{ data: prods }, { data: allVotes }, { data: history }, ctrs] = await Promise.all([
        supabase.from("products").select("*").eq("status", 1),
        supabase.from("votes").select("product_id, value"),
        supabase.from("demand_history").select("product_id, demand").eq("date", yDate),
        fetchCountries(),
      ]);

      if (!prods) { setLoading(false); return; }

      const votesByProduct: Record<string, { quiero: number; necesito: number; paso: number }> = {};
      allVotes?.forEach(v => {
        if (!votesByProduct[v.product_id]) votesByProduct[v.product_id] = { quiero: 0, necesito: 0, paso: 0 };
        if (v.value === 1)  votesByProduct[v.product_id].quiero++;
        if (v.value === 2)  votesByProduct[v.product_id].necesito++;
        if (v.value === -1) votesByProduct[v.product_id].paso++;
      });

      const histMap: Record<string, number> = {};
      history?.forEach(h => { histMap[h.product_id] = h.demand; });

      const withData = prods
        .map(p => {
          const v     = votesByProduct[p.id] ?? { quiero: 0, necesito: 0, paso: 0 };
          const total = v.quiero + v.necesito + v.paso;
          const demand_live = total > 0 ? Math.round(((v.quiero + v.necesito) / total) * 100) : 0;

          // Tipo más votado y su %
          let top_label = "lo necesitamos";
          let top_pct   = 0;
          if (total > 0) {
            if (v.quiero >= v.necesito && v.quiero >= v.paso) {
              top_label = "lo queremos";
              top_pct   = Math.round((v.quiero / total) * 100);
            } else if (v.necesito >= v.paso) {
              top_label = "lo necesitamos";
              top_pct   = Math.round((v.necesito / total) * 100);
            } else {
              top_label = "no camina acá";
              top_pct   = Math.round((v.paso / total) * 100);
            }
          }

          return {
            ...p,
            demand_live,
            top_label,
            top_pct,
            delta: histMap[p.id] !== undefined ? Math.round(demand_live - histMap[p.id]) : null,
          };
        })
        .sort((a, b) => b.top_pct - a.top_pct)
        .slice(0, 20);

      setProducts(withData);

      const today = new Date().toISOString().split("T")[0];
      await supabase.from("demand_history").upsert(
        withData.map(p => ({ product_id: p.id, demand: p.demand_live, date: today })),
        { onConflict: "product_id,date" }
      );

      setCountries(ctrs);
      setLoading(false);
    }
    load();
  }, []);

  function getCountry(code: string) {
    return countries.find((c) => c.code === code);
  }

  function Ring({ value, category }: { value: number; category: string }) {
    const r    = 22;
    const circ = 2 * Math.PI * r;
    const dash = circ - (value / 100) * circ;
    const color = getCategoryColor(category).bg;
    return (
      <svg width="52" height="52" className="-rotate-90 shrink-0">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e5e5" strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-sm mx-auto px-4 py-4 pb-24">
        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-16">Todavía no hay productos rankeados.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((p, i) => {
              const country = getCountry(p.country);
              const delta   = p.delta;
              const isUp    = delta !== null && delta > 0;

              return (
                <div key={p.id} className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "4px 4px" }} />
                  <div className="relative flex items-center gap-3 py-3 px-4 bg-white rounded-2xl border-[2.5px] border-black">

                    {/* Número */}
                    <span className="font-[family-name:var(--font-syne)] font-black text-2xl shrink-0 w-10 text-center leading-none"
                      style={{ color: i < 3 ? "#0a0a0a" : "#d1d5db" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Imagen */}
                    <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-black"
                      style={{ backgroundColor: getCategoryColor(p.category).bg }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                        : <span className="text-lg">📦</span>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-[family-name:var(--font-syne)] font-bold text-sm leading-tight truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {country?.flag} {country?.name ?? p.country}
                      </p>
                    </div>

                    {/* Ring + % grande + label + delta */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Ring value={p.demand_live} category={p.category} />
                      <div className="text-right min-w-[72px]">
                        <p className="font-[family-name:var(--font-syne)] font-black text-2xl leading-none">
                          {p.top_pct}%
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-tight italic mb-1">
                          {p.top_label}
                        </p>
                        {delta !== null && delta !== 0 && (
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                            isUp ? "bg-[#C8F000] text-black" : "bg-[#FF3CAC] text-white"
                          }`}>
                            {isUp ? "↑" : "↓"} {isUp ? "+" : ""}{delta}%
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}