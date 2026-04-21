// src/app/ranking/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";
import { Product } from "@/types/index";
import { TrendingUp } from "lucide-react";

export default function RankingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data }, ctrs] = await Promise.all([
        supabase.from("products").select("*").eq("status", 1).order("demand", { ascending: false }).limit(20),
        fetchCountries(),
      ]);
      if (data) setProducts(data);
      setCountries(ctrs);
      setLoading(false);
    }
    load();
  }, []);

  function getCountry(code: string) {
    return countries.find((c) => c.code === code);
  }

  return (
    <div className="px-6 py-6 max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={20} />
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-xl">Ranking</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-16">Todavía no hay productos rankeados.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p, i) => {
            const country = getCountry(p.country);
            return (
              <div key={p.id} className="bg-card rounded-2xl p-4 flex items-center gap-4 border border-border">
                <span className="font-[family-name:var(--font-syne)] font-bold text-2xl text-muted-foreground w-8 shrink-0">{i + 1}</span>
                <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl" style={{ backgroundColor: p.image_color }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain" /> : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{country?.flag} {country?.name ?? p.country} · {p.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{p.demand}%</p>
                  <p className="text-xs text-muted-foreground">demanda</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}