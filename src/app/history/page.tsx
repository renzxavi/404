// src/app/historial/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hook/useAuth";
import { Clock, ThumbsUp, ThumbsDown, Bookmark, Package, MessageSquare } from "lucide-react";

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

interface CommentWithProduct {
  id: string;
  body: string;
  created_at: string;
  products: {
    name: string;
    image_color: string;
    image_url?: string;
  };
}

export default function HistorialPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab]         = useState<"votos" | "subidos" | "comentarios">("votos");
  const [votes, setVotes]     = useState<VoteWithProduct[]>([]);
  const [uploads, setUploads] = useState<ProductItem[]>([]);
  const [comments, setComments] = useState<CommentWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    Promise.all([
      supabase.from("votes").select("id, value, created_at, products(name, image_color, image_url, category, country)")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("products").select("id, name, image_color, image_url, category, country, demand, created_at")
        .eq("created_by", user.id).order("created_at", { ascending: false }),
      supabase.from("comments").select("id, body, created_at, products(name, image_color, image_url)")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([votesRes, uploadsRes, commentsRes]) => {
      if (votesRes.data)    setVotes(votesRes.data as unknown as VoteWithProduct[]);
      if (uploadsRes.data)  setUploads(uploadsRes.data as ProductItem[]);
      if (commentsRes.data) setComments(commentsRes.data as unknown as CommentWithProduct[]);
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

  const voteBadge = (value: number) => {
    if (value === 1)  return { text: "Quiero",   cls: "bg-[#C8F000] text-black",    icon: <ThumbsUp size={11} /> };
    if (value === 2)  return { text: "Necesito", cls: "bg-[#2563FF] text-white",    icon: <Bookmark size={11} /> };
    return                   { text: "Paso",     cls: "bg-[#FF3CAC] text-white",    icon: <ThumbsDown size={11} /> };
  };

  const tabs = [
    { id: "votos",       label: "Votos",       count: votes.length,    icon: <Clock size={13} /> },
    { id: "subidos",     label: "Subidos",     count: uploads.length,  icon: <Package size={13} /> },
    { id: "comentarios", label: "Comentarios", count: comments.length, icon: <MessageSquare size={13} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {tabs.map((t, i) => (
          <button key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[8px] font-black uppercase tracking-wider transition-all border-b-2"
            style={{
              borderBottomColor: tab === t.id ? "#1a1a1a" : "transparent",
              color: tab === t.id ? "#1a1a1a" : "#aaaaaa",
            }}>
            {t.icon} {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2 max-w-sm mx-auto">

          {/* VOTOS */}
          {tab === "votos" && (
            votes.length === 0
              ? <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Clock size={28} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Todavía no votaste ningún producto.</p>
                </div>
              : votes.map((v) => {
                  const { text, cls, icon } = voteBadge(v.value);
                  return (
                    <div key={v.id} className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
                      <div className="relative bg-white rounded-2xl p-3 flex items-center gap-3 border-[2.5px] border-black">
                        <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-black"
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
                        <span className={`shrink-0 flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full border-2 border-black ${cls}`}>
                          {icon} {text}
                        </span>
                      </div>
                    </div>
                  );
                })
          )}

          {/* SUBIDOS */}
          {tab === "subidos" && (
            uploads.length === 0
              ? <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <Package size={28} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Todavía no subiste ningún producto.</p>
                </div>
              : uploads.map((p) => (
                  <div key={p.id} className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
                    <div className="relative bg-white rounded-2xl p-3 flex items-center gap-3 border-[2.5px] border-black">
                      <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-black"
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
                        <p className="font-black text-sm">{Math.round(p.demand)}%</p>
                        <p className="text-[9px] text-muted-foreground">demanda</p>
                      </div>
                    </div>
                  </div>
                ))
          )}

          {/* COMENTARIOS */}
          {tab === "comentarios" && (
            comments.length === 0
              ? <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <MessageSquare size={28} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Todavía no comentaste nada.</p>
                </div>
              : comments.map((c) => (
                  <div key={c.id} className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
                    <div className="relative bg-white rounded-2xl p-3 flex items-start gap-3 border-[2.5px] border-black">
                      <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-black"
                        style={{ backgroundColor: c.products?.image_color ?? "#eee" }}>
                        {c.products?.image_url
                          ? <img src={c.products.image_url} alt={c.products.name} className="w-full h-full object-contain p-1" />
                          : <span className="text-lg">📦</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-[family-name:var(--font-syne)] font-bold text-xs truncate mb-1">{c.products?.name}</p>
                        <p className="text-sm font-bold text-black/80 leading-snug">{c.body}</p>
                        <p className="text-[9px] text-black/30 font-bold mt-1">
                          {new Date(c.created_at).toLocaleDateString("es-UY")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
          )}

        </div>
      </div>
    </div>
  );
}