// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import CategoryTabs from "@/components/layout/CategoryTabs";
import SwipeCard from "@/components/product/SwipeCard";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/index";
import { useAuth } from "@/hook/useAuth";

function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("session_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("session_id", id); }
  return id;
}

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [index, setIndex]       = useState(0);
  const [voted, setVoted]       = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", 1)
        .order("created_at", { ascending: false });

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("country")
          .eq("id", user.id)
          .single();
        if (profile?.country) {
          query = query.neq("country", profile.country);
        }
      }

      const { data } = await query;
      if (!data) { setLoading(false); return; }

      // Filtrar productos ya votados Y productos importados (status=2)
      let votedIds: string[] = [];

      if (user) {
        // Con cuenta: buscar por user_id
        const { data: votes } = await supabase
          .from("votes")
          .select("product_id")
          .eq("user_id", user.id);
        votedIds = votes?.map(v => v.product_id) ?? [];
      } else {
        // Sin cuenta: buscar por session_id
        const sessionId = getSessionId();
        const { data: votes } = await supabase
          .from("votes")
          .select("product_id")
          .eq("session_id", sessionId)
          .is("user_id", null);
        votedIds = votes?.map(v => v.product_id) ?? [];
      }

      setProducts(data.filter(p => !votedIds.includes(p.id)));
      setLoading(false);
    }
    fetchProducts();
  }, [user]);

  async function handleVote(value: 1 | -1 | "need") {
    const p = products[index];
    if (!p) return;

    const dbValue = value === "need" ? 2 : value;

    // Intentar insertar — si ya votó, actualizar el valor existente
    if (user) {
      // Usuario registrado: buscar voto existente y actualizar
      const { data: existing } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", p.id)
        .single();

      if (existing) {
        await supabase.from("votes").update({ value: dbValue }).eq("id", existing.id);
      } else {
        await supabase.from("votes").insert({
          product_id: p.id, user_id: user.id,
          session_id: getSessionId(), value: dbValue, weight: 1,
        });
      }
    } else {
      // Anónimo: buscar por session_id
      const sessionId = getSessionId();
      const { data: existing } = await supabase
        .from("votes")
        .select("id")
        .eq("session_id", sessionId)
        .eq("product_id", p.id)
        .is("user_id", null)
        .single();

      if (existing) {
        await supabase.from("votes").update({ value: dbValue }).eq("id", existing.id);
      } else {
        await supabase.from("votes").insert({
          product_id: p.id, user_id: null,
          session_id: sessionId, value: dbValue, weight: 0.3,
        });
      }
    }

    setVoted(v => [...v, p.id]);
    setIndex(i => i + 1);
  }

  const current = products[index];



  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CategoryTabs />
      <div className="flex-1 flex overflow-hidden">

        {/* Desktop izq */}
        <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
          <span aria-hidden className="pointer-events-none select-none text-[18vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.05] leading-none">404</span>
        </div>

        {/* Centro — en mobile ocupa todo, en desktop max 45% del ancho */}
        <div className="flex items-center justify-center px-3 relative w-full md:w-[45%] md:max-w-[600px] md:min-w-[400px]">
          <span aria-hidden className="md:hidden pointer-events-none select-none absolute left-[-3%] top-1/2 -translate-y-1/2 text-[28vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.04] leading-none">404</span>
          <span aria-hidden className="md:hidden pointer-events-none select-none absolute right-[-4%] bottom-2 text-[22vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.04] leading-none">404</span>
          <div className="relative z-10 w-full">
            {loading ? (
              <div className="flex justify-center"><div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" /></div>
            ) : current ? (
              <SwipeCard key={current.id} product={current} onVote={handleVote} />
            ) : (
              <div className="text-center max-w-xs mx-auto">
                <p className="font-[family-name:var(--font-syne)] font-bold text-2xl mb-2">¡Eso es todo!</p>
                <p className="text-muted-foreground text-sm">
                  {voted.length > 0 ? `Votaste ${voted.length} producto${voted.length !== 1 ? "s" : ""}.` : "No hay productos para mostrar."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop der */}
        <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
          <span aria-hidden className="pointer-events-none select-none text-[18vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.05] leading-none">404</span>
        </div>

      </div>
    </div>
  );
}