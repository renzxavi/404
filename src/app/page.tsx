// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import CategoryTabs from "@/components/layout/CategoryTabs";
import SwipeCard from "@/components/product/SwipeCard";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/index";
import { useAuth } from "@/hook/useAuth";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "matcha-kit-kat",
    name: "Matcha Kit Kat",
    description: "La versión de Kit Kat de Nestlé japonesa con sabor a matcha premium. Textura más delicada y dulzor balanceado.",
    category: "FOOD",
    country: "JP",
    status: 1,
    image_color: "#c8f000",
    demand: 35,
    target_market: "EE.UU.",
    created_at: new Date().toISOString(),
  },
  {
    id: "calbee-chips",
    name: "Calbee Potato Chips",
    description: "Las papas fritas japonesas más famosas. Sabores únicos como nori shio y consomé que no existen en occidente.",
    category: "FOOD",
    country: "JP",
    status: 1,
    image_color: "#ffe66d",
    demand: 62,
    target_market: "EE.UU.",
    created_at: new Date().toISOString(),
  },
];

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("session_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("session_id", id); }
  return id;
}

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [index, setIndex] = useState(0);
  const [voted, setVoted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from("products").select("*").eq("status", 1).order("created_at", { ascending: false });
      if (data && data.length > 0) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  async function handleVote(value: 1 | -1) {
    const product = products[index];
    if (!product) return;
    await supabase.from("votes").insert({ product_id: product.id, user_id: user?.id ?? null, session_id: getSessionId(), value, weight: user ? 1 : 0.3 });
    setVoted((prev) => [...prev, product.id]);
    setIndex((prev) => prev + 1);
  }

  const current = products[index];

  if (loading) return (
    <div className="flex items-center justify-center h-[60dvh]">
      <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-full">
      <CategoryTabs />
      <div className="relative flex-1 flex items-center justify-center px-6 py-8 overflow-hidden">
        <span aria-hidden className="pointer-events-none select-none absolute left-[-2%] top-1/2 -translate-y-1/2 text-[22vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.04] leading-none">404</span>
        <span aria-hidden className="pointer-events-none select-none absolute right-[-5%] bottom-0 text-[18vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.04] leading-none">404</span>
        <div className="relative z-10 w-full">
          {current ? (
            <SwipeCard key={current.id} product={current} onVote={handleVote} />
          ) : (
            <div className="text-center py-16">
              <p className="font-[family-name:var(--font-syne)] font-bold text-2xl mb-2">¡Eso es todo!</p>
              <p className="text-muted-foreground text-sm">Votaste {voted.length} productos. Volvé mañana para ver nuevos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}