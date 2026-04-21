// src/components/product/SwipeCard.tsx
"use client";

import { useState, useRef } from "react";
import { ArrowUpRight, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types/index";
import { cn } from "@/lib/utils";
import DemandMeter from "./DemandMeter";

interface SwipeCardProps {
  product: Product;
  onVote: (value: 1 | -1) => void;
}

export default function SwipeCard({ product, onVote }: SwipeCardProps) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    startX.current = e.clientX;
    cardRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setOffset(e.clientX - startX.current);
  }

  function onPointerUp() {
    setDragging(false);
    if (offset > 100) triggerVote("right");
    else if (offset < -100) triggerVote("left");
    else setOffset(0);
  }

  function triggerVote(direction: "left" | "right") {
    setLeaving(direction);
    setTimeout(() => {
      onVote(direction === "right" ? 1 : -1);
      setOffset(0);
      setLeaving(null);
    }, 350);
  }

  const rotate = offset * 0.08;
  const translateX = leaving === "right" ? 400 : leaving === "left" ? -400 : offset;
  const opacity = leaving ? 0 : 1;

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Indicators */}
      <div className={cn("absolute top-6 left-6 z-20 border-2 border-green-500 text-green-500 font-bold text-lg px-3 py-1 rounded-xl rotate-[-15deg] transition-opacity", offset > 40 ? "opacity-100" : "opacity-0")}>
        QUIERO
      </div>
      <div className={cn("absolute top-6 right-6 z-20 border-2 border-red-500 text-red-500 font-bold text-lg px-3 py-1 rounded-xl rotate-[15deg] transition-opacity", offset < -40 ? "opacity-100" : "opacity-0")}>
        PASO
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ transform: `translateX(${translateX}px) rotate(${rotate}deg)`, opacity, transition: dragging ? "none" : "transform 0.35s ease, opacity 0.35s ease", cursor: dragging ? "grabbing" : "grab" }}
        className="bg-card text-card-foreground rounded-3xl shadow-lg overflow-hidden touch-none"
      >
        <div className="relative h-64 flex items-center justify-center" style={{ backgroundColor: product.image_color }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} className="h-32 w-32 object-contain drop-shadow-xl pointer-events-none" />
            : <div className="h-32 w-32 rounded-2xl bg-white/20 flex items-center justify-center text-5xl">📦</div>
          }
          <Link href={`/producto/${product.id}`} onClick={(e) => e.stopPropagation()} className="absolute bottom-3 right-3 flex items-center gap-1 bg-foreground/80 hover:bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
            VER DETALLES <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 border border-border rounded-full px-2.5 py-1 text-xs font-medium">
              {product.country}
            </span>
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">{product.category}</span>
          </div>
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-2xl leading-tight mb-2">{product.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">{product.description}</p>
          <DemandMeter value={product.demand} market={product.target_market} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-6 mt-6">
        <button onClick={() => triggerVote("left")} className="w-14 h-14 rounded-full bg-card border border-border shadow flex items-center justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors">
          <ThumbsDown size={22} />
        </button>
        <button onClick={() => triggerVote("right")} className="w-14 h-14 rounded-full bg-card border border-border shadow flex items-center justify-center hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-colors">
          <ThumbsUp size={22} />
        </button>
      </div>
    </div>
  );
}