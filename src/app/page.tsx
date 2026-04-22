// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import CategoryTabs from "@/components/layout/CategoryTabs";
import SwipeCard from "@/components/product/SwipeCard";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/index";
import { useAuth } from "@/hook/useAuth";

const MOCK_IDS = new Set<string>();

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
    supabase.from("products").select("*").eq("status", 1).order("created_at", { ascending: false })
      .then(({ data }) => { if (data?.length) setProducts(data); setLoading(false); });
  }, []);

  async function handleVote(value: 1 | -1 | "need") {
    const p = products[index];
    if (!p) return;
    const dbValue = value === "need" ? 2 : value;
    // No intentar guardar votos de productos mock (solo existen en memoria)
    if (!MOCK_IDS.has(p.id)) {
      await supabase.from("votes").insert({
        product_id: p.id, user_id: user?.id ?? null,
        session_id: getSessionId(), value: dbValue, weight: user ? 1 : 0.3,
      }).then(({ error }) => { if (error && error.code !== "23505") console.error(error); });
    }
    setVoted(v => [...v, p.id]);
    setIndex(i => i + 1);
  }

  const current = products[index];

  return (
    // h-full hereda el calc del main en layout
    <div className="h-full flex flex-col">
      <CategoryTabs />

      {/* Área restante — CategoryTabs es ~41px */}
      <div className="flex-1 flex items-center justify-center min-h-0 relative">

        {/* 404 deco desktop */}
        <span aria-hidden className="hidden md:block pointer-events-none select-none absolute left-4 top-1/2 -translate-y-1/2 text-[14vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.05] leading-none">404</span>
        <span aria-hidden className="hidden md:block pointer-events-none select-none absolute right-4 bottom-0 text-[12vw] font-[family-name:var(--font-syne)] font-extrabold text-foreground/[0.05] leading-none">404</span>

        {loading ? (
          <div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        ) : current ? (
          <SwipeCard key={current.id} product={current} onVote={handleVote} />
        ) : (
          <div className="text-center px-6">
            <p className="font-[family-name:var(--font-syne)] font-bold text-2xl mb-2">¡Eso es todo!</p>
            <p className="text-muted-foreground text-sm">Votaste {voted.length} producto{voted.length !== 1 ? "s" : ""}.</p>
          </div>
        )}
      </div>
    </div>
  );
}