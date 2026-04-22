// src/app/historial/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hook/useAuth";
import { Clock, ThumbsUp, ThumbsDown, Bookmark, Package } from "lucide-react";

interface VoteWithProduct {
  id: string;
  value: number;
  created_at: string;
  products: {
    name: string;
    image_color: string;
    image_url?: string;
    category: string;
    country: string;
  };
}

interface ProductItem {
  id: string;
  name: string;
  image_color: string;
  image_url?: string;
  category: string;
  country: string;
  demand: number;
  created_at: string;
}

export default function HistorialPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab]           = useState<"votos" | "subidos">("votos");
  const [votes, setVotes]       = useState<VoteWithProduct[]>([]);
  const [uploads, setUploads]   = useState<ProductItem[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    Promise.all([
      supabase
        .from("votes")
        .select("id, value, created_at, products(name, image_color, image_url, category, country)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("products")
        .select("id, name, image_color, image_url, category, country, demand, created_at")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false }),
    ]).then(([votesRes, uploadsRes]) => {
      if (votesRes.data)   setVotes(votesRes.data as unknown as VoteWithProduct[]);
      if (uploadsRes.data) setUploads(uploadsRes.data as ProductItem[]);
      setLoading(false);
    });
  }, [user]);

  if (authLoading || loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Clock size={32} className="text-muted-foreground" />
      <div>
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-xl mb-1">Historial</h1>
        <p className="text-sm text-muted-foreground max-w-xs">Esta sección es solo para usuarios registrados.</p>
      </div>
    </div>
  );

  const badge = (value: number) => {
    if (value === 1)  return { text: "Quiero",   cls: "bg-green-100 text-green-700", icon: <ThumbsUp size={11} /> };
    if (value === 2)  return { text: "Necesito", cls: "bg-blue-100 text-blue-700",   icon: <Bookmark size={11} /> };
    return                   { text: "Paso",     cls: "bg-red-100 text-red-600",     icon: <ThumbsDown size={11} /> };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        <button
          onClick={() => setTab("votos")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${tab === "votos" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
        >
          <Clock size={13} /> Votos ({votes.length})
        </button>
        <button
          onClick={() => setTab("subidos")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${tab === "subidos" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
        >
          <Package size={13} /> Subidos ({uploads.length})
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2 max-w-sm mx-auto">

          {/* TAB VOTOS */}
          {tab === "votos" && (
            votes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Clock size={28} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Todavía no votaste ningún producto.</p>
              </div>
            ) : votes.map((v) => {
              const { text, cls, icon } = badge(v.value);
              return (
                <div key={v.id} className="bg-card rounded-2xl p-3 flex items-center gap-3 border border-border">
                  <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: v.products?.image_color ?? "#eee" }}>
                    {v.products?.image_url
                      ? <img src={v.products.image_url} alt={v.products.name} className="w-full h-full object-contain p-1" />
                      : <span className="text-lg">📦</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{v.products?.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {v.products?.country} · {v.products?.category}
                    </p>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${cls}`}>
                    {icon} {text}
                  </span>
                </div>
              );
            })
          )}

          {/* TAB SUBIDOS */}
          {tab === "subidos" && (
            uploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Package size={28} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Todavía no subiste ningún producto.</p>
              </div>
            ) : uploads.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl p-3 flex items-center gap-3 border border-border">
                <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: p.image_color ?? "#eee" }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                    : <span className="text-lg">📦</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {p.country} · {p.category}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{p.demand}%</p>
                  <p className="text-[10px] text-muted-foreground">demanda</p>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}