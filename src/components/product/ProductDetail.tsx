// src/components/product/ProductDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { X, ThumbsUp, ThumbsDown, Bookmark, TrendingUp, Globe, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchCountries } from "@/lib/countries";
import { Product } from "@/types/index";
import DemandMeter from "./DemandMeter";

interface ProductDetailProps {
  productId: string;
  onClose: () => void;
}

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
}

interface VoteSummary {
  quiero: number;
  necesito: number;
  paso: number;
  total: number;
}

export default function ProductDetail({ productId, onClose }: ProductDetailProps) {
  const [product, setProduct]   = useState<Product | null>(null);
  const [votes, setVotes]       = useState<VoteSummary>({ quiero: 0, necesito: 0, paso: 0, total: 0 });
  const [comments, setComments] = useState<Comment[]>([]);
  const [countryName, setCountryName] = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const [productRes, votesRes, commentsRes, countries] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase.from("votes").select("value, weight").eq("product_id", productId),
        supabase.from("comments").select("id, body, created_at, user_id").eq("product_id", productId).eq("phase", 1).order("created_at", { ascending: false }).limit(10),
        fetchCountries(),
      ]);

      if (productRes.data) setProduct(productRes.data as Product);

      if (votesRes.data) {
        const summary = votesRes.data.reduce((acc, v) => {
          acc.total++;
          if (v.value === 1)  acc.quiero++;
          if (v.value === 2)  acc.necesito++;
          if (v.value === -1) acc.paso++;
          return acc;
        }, { quiero: 0, necesito: 0, paso: 0, total: 0 });
        setVotes(summary);
      }

      if (commentsRes.data) setComments(commentsRes.data);

      if (productRes.data) {
        const c = countries.find(c => c.code === productRes.data.country);
        if (c) setCountryName(`${c.flag} ${c.name}`);
      }

      setLoading(false);
    }
    load();
  }, [productId]);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-background w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">

        {/* Imagen header */}
        <div
          className="relative w-full flex items-center justify-center p-10"
          style={{ height: 220, backgroundColor: product.image_color }}
        >
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
            : <span className="text-6xl">📦</span>
          }
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-foreground/70 text-background flex items-center justify-center hover:bg-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col gap-4">

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border rounded-full px-2.5 py-1">
              <Globe size={10} /> {countryName || product.country}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border rounded-full px-2.5 py-1">
              <Tag size={10} /> {product.category}
            </span>
            {product.status === 2 && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 rounded-full px-2.5 py-1">
                ✓ Importado
              </span>
            )}
          </div>

          {/* Nombre */}
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-2xl leading-tight uppercase">
            {product.name}
          </h2>

          {/* Descripción */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Demanda */}
          <div className="border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">Demanda</span>
            </div>
            <DemandMeter value={product.demand} market={product.target_market} />
          </div>

          {/* Resumen de votos */}
          {votes.total > 0 && (
            <div className="border border-border rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3">{votes.total} votos</p>
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col items-center gap-1 bg-green-50 rounded-xl py-2">
                  <ThumbsUp size={14} className="text-green-600" />
                  <span className="text-sm font-bold text-green-700">{votes.quiero}</span>
                  <span className="text-[9px] text-green-600 uppercase tracking-wider">Quiero</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 bg-blue-50 rounded-xl py-2">
                  <Bookmark size={14} className="text-blue-600" />
                  <span className="text-sm font-bold text-blue-700">{votes.necesito}</span>
                  <span className="text-[9px] text-blue-600 uppercase tracking-wider">Necesito</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 bg-red-50 rounded-xl py-2">
                  <ThumbsDown size={14} className="text-red-500" />
                  <span className="text-sm font-bold text-red-600">{votes.paso}</span>
                  <span className="text-[9px] text-red-500 uppercase tracking-wider">Paso</span>
                </div>
              </div>
            </div>
          )}

          {/* Comentarios */}
          {comments.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3">Comentarios</p>
              <div className="flex flex-col gap-2">
                {comments.map((c) => (
                  <div key={c.id} className="bg-muted rounded-2xl px-4 py-3">
                    <p className="text-sm text-foreground">{c.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(c.created_at).toLocaleDateString("es-UY")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}