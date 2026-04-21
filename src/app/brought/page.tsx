// src/app/traidos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";
import { Product } from "@/types/index";
import { ShoppingBag, CheckCircle2 } from "lucide-react";

export default function TraidosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data }, ctrs] = await Promise.all([
        supabase.from("products").select("*").eq("status", 2).order("created_at", { ascending: false }),
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
      <div className="flex items-center gap-2 mb-2">
        <ShoppingBag size={20} />
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-xl">Traídos</h1>
      </div>
      <p className="text-muted-foreground text-xs mb-6">Productos que la comunidad logró traer a Uruguay.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          <CheckCircle2 size={32} className="mx-auto mb-3 opacity-30" />
          Todavía no hay productos importados.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => {
            const country = getCountry(p.country);
            return (
              <div key={p.id} className="bg-card rounded-2xl p-4 flex items-center gap-4 border border-border">
                <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: p.image_color }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain" /> : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{country?.flag} {country?.name ?? p.country}</p>
                </div>
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}