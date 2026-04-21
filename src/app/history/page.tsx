// src/app/historial/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hook/useAuth";
import { Clock } from "lucide-react";

export default function HistorialPage() {
  const { user, loading: authLoading } = useAuth();
  const [votes, setVotes] = useState<{ product_id: string; value: number; products: { name: string; image_color: string } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function fetch() {
      const { data } = await supabase
        .from("votes")
        .select("product_id, value, products(name, image_color)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (data) setVotes(data as never);
      setLoading(false);
    }
    fetch();
  }, [user]);

  if (authLoading || loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-[70dvh] gap-3 text-center px-6">
      <Clock size={32} className="text-muted-foreground" />
      <h1 className="font-[family-name:var(--font-syne)] font-bold text-xl">Tu historial</h1>
      <p className="text-muted-foreground text-sm">Necesitás una cuenta para ver tu historial de votos.</p>
    </div>
  );

  return (
    <div className="px-6 py-6 max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={20} />
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-xl">Tu historial</h1>
      </div>
      {votes.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-16">Todavía no votaste ningún producto.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {votes.map((v, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 flex items-center gap-3 border border-border">
              <div className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: v.products?.image_color ?? "#eee" }} />
              <p className="flex-1 font-medium text-sm">{v.products?.name ?? v.product_id}</p>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.value === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {v.value === 1 ? "✓ Quiero" : "✗ Paso"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}