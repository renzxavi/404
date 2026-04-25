// src/components/product/ProductDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { X, ThumbsUp, ThumbsDown, Bookmark, Send, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchCountries } from "@/lib/countries";
import { Product } from "@/types/index";
import { getCategoryColor } from "@/lib/categories";
import { useAuth } from "@/hook/useAuth";
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
  const { user } = useAuth();
  const [product, setProduct]       = useState<Product | null>(null);
  const [votes, setVotes]           = useState<VoteSummary>({ quiero: 0, necesito: 0, paso: 0, total: 0 });
  const [comments, setComments]     = useState<Comment[]>([]);
  const [countryName, setCountryName] = useState("");
  const [loading, setLoading]       = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending]       = useState(false);

  useEffect(() => {
    async function load() {
      const [productRes, votesRes, commentsRes, countries] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase.from("votes").select("value").eq("product_id", productId),
        supabase.from("comments").select("id, body, created_at, user_id").eq("product_id", productId).order("created_at", { ascending: false }),
        fetchCountries(),
      ]);
      if (productRes.data) {
        setProduct(productRes.data as Product);
        const c = countries.find(c => c.code === productRes.data.country);
        if (c) setCountryName(`${c.flag} ${c.name}`);
      }
      if (votesRes.data) {
        const s = votesRes.data.reduce((acc, v) => {
          acc.total++;
          if (v.value === 1)  acc.quiero++;
          if (v.value === 2)  acc.necesito++;
          if (v.value === -1) acc.paso++;
          return acc;
        }, { quiero: 0, necesito: 0, paso: 0, total: 0 });
        setVotes(s);
      }
      if (commentsRes.data) setComments(commentsRes.data as Comment[]);
      setLoading(false);
    }
    load();
  }, [productId]);

  async function handleComment() {
    if (!newComment.trim() || !user) return;
    setSending(true);
    const { data, error } = await supabase.from("comments").insert({
      product_id: productId, user_id: user.id, body: newComment.trim(),
    }).select("id, body, created_at, user_id").single();
    if (!error && data) { setComments(prev => [data as Comment, ...prev]); setNewComment(""); }
    setSending(false);
  }

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-8 h-8 rounded-full border-[3px] border-black border-t-transparent animate-spin" />
    </div>
  );
  if (!product) return null;

  const catColor = getCategoryColor(product.category);
  const visibleComments = user ? comments : comments.slice(0, 1);
  const hiddenCount = comments.length - visibleComments.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — ancho máximo, alto controlado */}
      <div className="relative z-10 w-full" style={{ maxWidth: "680px" }}>
        <div className="absolute inset-0 rounded-[32px] bg-black" style={{ translate: "6px 6px" }} />

        <div className="relative bg-white rounded-[32px] border-[3px] border-black overflow-hidden flex"
          style={{ maxHeight: "75dvh" }}>

          {/* Columna izquierda — imagen */}
          <div className="shrink-0 flex flex-col" style={{ width: "200px", backgroundColor: catColor.bg }}>
            <div className="flex-1 flex items-center justify-center p-4">
              {product.image_url
                ? <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" style={{ maxHeight: "160px" }} />
                : <span className="text-6xl">📦</span>
              }
            </div>
            {product.status === 2 && (
              <div className="m-3 mt-0 bg-black text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-center">
                ✓ Importado
              </div>
            )}
          </div>

          {/* Columna derecha — contenido scrollable */}
          <div className="flex-1 overflow-y-auto border-l-[3px] border-black">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b-[3px] border-black sticky top-0 bg-white z-10">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border-2 border-black">
                    {countryName || product.country}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: catColor.bg, color: catColor.text }}>
                    {product.category}
                  </span>
                  {product.created_by ? (
                    <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-[#2563FF] text-white">
                      {product.created_by.slice(0, 8)}
                    </span>
                  ) : (
                    <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border-2 border-black">Anónimo</span>
                  )}
                </div>
                <h2 className="text-lg font-[950] leading-none tracking-tighter uppercase">{product.name}</h2>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shrink-0">
                <X size={14} strokeWidth={3} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Descripción */}
              {product.description && (
                <p className="text-xs font-bold text-black/50 leading-relaxed uppercase">{product.description}</p>
              )}

              {/* Demanda */}
              <div className="border-2 border-black rounded-2xl p-3">
                <p className="text-[8px] font-black uppercase tracking-widest mb-2">Demanda</p>
                <DemandMeter value={product.demand} market={product.target_market} />
              </div>

              {/* Distribución */}
              {votes.total > 0 && (
                <div className="border-2 border-black rounded-2xl p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest mb-2">Distribución</p>
                  <div className="flex gap-1.5">
                    <div className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 border-2 border-black">
                      <ThumbsUp size={12} />
                      <span className="text-xs font-[950]">{Math.round((votes.quiero / votes.total) * 100)}%</span>
                      <span className="text-[7px] font-black uppercase tracking-wider">Quiero</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 border-2 border-black bg-[#2563FF] text-white">
                      <Bookmark size={12} />
                      <span className="text-xs font-[950]">{Math.round((votes.necesito / votes.total) * 100)}%</span>
                      <span className="text-[7px] font-black uppercase tracking-wider">Necesito</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 border-2 border-black bg-[#FF3CAC] text-white">
                      <ThumbsDown size={12} />
                      <span className="text-xs font-[950]">{Math.round((votes.paso / votes.total) * 100)}%</span>
                      <span className="text-[7px] font-black uppercase tracking-wider">Paso</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Comentarios */}
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest mb-2">
                  Comentarios {comments.length > 0 && `(${comments.length})`}
                </p>

                {user ? (
                  <div className="relative mb-3">
                    <input value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleComment()}
                      placeholder="Escribí un comentario..."
                      className="w-full rounded-2xl border-[2.5px] border-black bg-white pl-4 pr-12 py-2.5 text-sm font-bold outline-none focus:bg-black/5 transition-all placeholder:text-black/30" />
                    <button onClick={handleComment} disabled={sending || !newComment.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center hover:opacity-80 disabled:opacity-30">
                      <Send size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3 border-2 border-black rounded-2xl px-3 py-2.5 bg-black/5">
                    <Lock size={11} strokeWidth={2.5} />
                    <p className="text-[9px] font-black uppercase tracking-wider">Iniciá sesión para comentar</p>
                  </div>
                )}

                {comments.length === 0 ? (
                  <p className="text-xs text-black/40 font-bold text-center py-3">Sin comentarios todavía.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {visibleComments.map((c) => (
                      <div key={c.id} className="bg-black/5 rounded-2xl px-3 py-2.5 border-2 border-black/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black uppercase tracking-wider bg-[#2563FF] text-white px-2 py-0.5 rounded-full">
                            {c.user_id.slice(0, 8)}
                          </span>
                          <span className="text-[8px] text-black/30 font-bold">
                            {new Date(c.created_at).toLocaleDateString("es-UY")}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-black/80">{c.body}</p>
                      </div>
                    ))}
                    {!user && hiddenCount > 0 && (
                      <div className="relative">
                        {comments[1] && (
                          <div className="bg-black/5 rounded-2xl px-3 py-2.5 border-2 border-black/10 blur-sm select-none pointer-events-none">
                            <p className="text-sm font-bold text-black/80">{comments[1].body}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-t from-white via-white/80 to-transparent rounded-2xl">
                          <Lock size={14} strokeWidth={2.5} />
                          <p className="text-[9px] font-black uppercase tracking-wider">{hiddenCount} más — iniciá sesión</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}