// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import CategoryTabs from "@/components/layout/CategoryTabs";
import SwipeCard from "@/components/product/SwipeCard";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/index";
import { useAuth } from "@/hook/useAuth";

const MOCK: Product[] = [
  { id: "matcha-kit-kat", name: "Matcha Kit Kat", description: "La versión de Kit Kat de Nestlé japonesa con sabor a matcha premium. Textura más delicada y dulzor balanceado.", category: "FOOD", country: "JP", status: 1, image_color: "#c8f000", demand: 35, target_market: "Uruguay", created_at: new Date().toISOString() },
  { id: "calbee-chips", name: "Calbee Potato Chips", description: "Las papas fritas japonesas más famosas. Sabores únicos como nori shio y consomé.", category: "FOOD", country: "JP", status: 1, image_color: "#ffe66d", demand: 62, target_market: "Uruguay", created_at: new Date().toISOString() },
];

function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("session_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("session_id", id); }
  return id;
}

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(MOCK);
  const [index, setIndex]       = useState(0);
  const [voted, setVoted]       = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.from("products").select("*").eq("status", 1).order("created_at", { ascending: false })
      .then(({ data }) => { if (data?.length) setProducts(data); setLoading(false); });
  }, []);

  async function handleVote(value: 1 | -1 | "need") {
    const p = products[index];
    if (!p) return;
    await supabase.from("votes").insert({
      product_id: p.id, user_id: user?.id ?? null,
      session_id: getSessionId(), value: value === "need" ? 1 : value, weight: user ? 1 : 0.3,
    }).then(({ error }) => { if (error && error.code !== "23505") console.error(error); });
    setVoted(v => [...v, p.id]);
    setIndex(i => i + 1);
  }

  const current = products[index];

  return (
    <div style={{ height: "calc(100dvh - 40px - 64px)" }} className="flex flex-col overflow-hidden">
      <CategoryTabs />
      <div className="flex-1 flex overflow-hidden">

        {/* Desktop izquierda — solo 404 deco */}
        <div className="hidden md:flex flex-1 items-center justify-end pr-8 relative overflow-hidden">
          <span aria-hidden className="pointer-events-none select-none absolute left-[-5%] top-1/2 -translate-y-1/2 text-[20vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.05] leading-none">404</span>
        </div>

        {/* Centro: card */}
        <div className="flex items-center justify-center px-4 md:px-8 relative w-full md:w-auto md:min-w-[480px] md:max-w-[560px]">
          <span aria-hidden className="md:hidden pointer-events-none select-none absolute left-[-3%] top-1/2 -translate-y-1/2 text-[28vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.04] leading-none">404</span>
          <span aria-hidden className="md:hidden pointer-events-none select-none absolute right-[-4%] bottom-2 text-[22vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.04] leading-none">404</span>
          <div className="relative z-10 w-full">
            {loading
              ? <div className="flex justify-center"><div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" /></div>
              : current
                ? <SwipeCard key={current.id} product={current} onVote={handleVote} />
                : <div className="text-center max-w-xs mx-auto">
                    <p className="font-[family-name:var(--font-syne)] font-bold text-2xl mb-2">¡Eso es todo!</p>
                    <p className="text-muted-foreground text-sm">Votaste {voted.length} producto{voted.length !== 1 ? "s" : ""}.</p>
                  </div>
            }
          </div>
        </div>

        {/* Desktop derecha — solo 404 deco */}
        <div className="hidden md:flex flex-1 items-center justify-start pl-8 relative overflow-hidden">
          <span aria-hidden className="pointer-events-none select-none absolute right-[-5%] bottom-0 text-[18vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.05] leading-none">404</span>
        </div>

      </div>
    </div>
  );
}