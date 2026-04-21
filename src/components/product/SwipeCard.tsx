// src/components/product/SwipeCard.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types/index";
import { cn } from "@/lib/utils";
import DemandMeter from "./DemandMeter";

const LONG_PRESS_MS = 700;
type HoldType = "like" | "dislike" | "need" | null;

interface SwipeCardProps {
  product: Product;
  onVote: (value: 1 | -1 | "need") => void;
}

export default function SwipeCard({ product, onVote }: SwipeCardProps) {
  const [dragging, setDragging]         = useState(false);
  const [offset, setOffset]             = useState(0);
  const [leaving, setLeaving]           = useState<"left"|"right"|"need"|null>(null);
  const [holdType, setHoldType]         = useState<HoldType>(null);
  const [holdProgress, setHoldProgress] = useState(0);

  const startX       = useRef(0);
  const cardRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number | null>(null);
  const pressStart   = useRef(0);
  const didLongPress = useRef(false);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const triggerVote = useCallback((direction: "left" | "right" | "need") => {
    setLeaving(direction);
    setHoldType(null);
    setHoldProgress(0);
    setTimeout(() => {
      onVote(direction === "right" ? 1 : direction === "left" ? -1 : "need");
      setOffset(0);
      setLeaving(null);
    }, 320);
  }, [onVote]);

  const animateHold = useCallback((type: HoldType) => {
    const tick = () => {
      const pct = Math.min(((Date.now() - pressStart.current) / LONG_PRESS_MS) * 100, 100);
      setHoldProgress(pct);
      if (pct < 100) { rafRef.current = requestAnimationFrame(tick); }
      else {
        didLongPress.current = true;
        triggerVote(type === "like" ? "right" : type === "dislike" ? "left" : "need");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [triggerVote]);

  const cancelHold = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setHoldType(null);
    setHoldProgress(0);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("a") || (e.target as HTMLElement).closest("button")) return;
    setDragging(true);
    didLongPress.current = false;
    startX.current = e.clientX;
    cardRef.current?.setPointerCapture(e.pointerId);
    pressStart.current = Date.now();
    setHoldType("need");
    animateHold("need");
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 10) cancelHold();
    setOffset(dx);
  }

  function onPointerUp() {
    setDragging(false);
    cancelHold();
    if (didLongPress.current) return;
    if (offset > 80) triggerVote("right");
    else if (offset < -80) triggerVote("left");
    else setOffset(0);
  }

  function startBtn(type: NonNullable<HoldType>) {
    didLongPress.current = false;
    pressStart.current = Date.now();
    setHoldType(type);
    animateHold(type);
  }
  function endBtn(type: NonNullable<HoldType>) {
    if (didLongPress.current) return;
    cancelHold();
    triggerVote(type === "like" ? "right" : type === "dislike" ? "left" : "need");
  }

  const rotate     = offset * 0.05;
  const translateX = leaving === "right" ? 600 : leaving === "left" ? -600 : offset;
  const translateY = leaving === "need" ? -600 : 0;
  const isLeaving  = !!leaving;

  const swipeRight = offset > 20;
  const swipeLeft  = offset < -20;

  // Fills
  const likeFill    = holdType === "like"    ? holdProgress : (swipeRight || leaving === "right") ? 100 : 0;
  const dislikeFill = holdType === "dislike" ? holdProgress : (swipeLeft  || leaving === "left")  ? 100 : 0;
  const needFill    = holdType === "need"    ? holdProgress : leaving === "need" ? 100 : 0;

  return (
    // Ocupa todo el espacio que le da page.tsx, sin scroll
    <div className="w-full h-full flex flex-col items-center gap-2 px-3 py-2 max-w-md mx-auto">

      {/* CARD — flex-1 toma todo el alto disponible */}
      <div className="relative w-full flex-1 min-h-0">

        {/* Indicadores swipe flotantes */}
        <div className={cn("absolute left-3 top-1/2 -translate-y-1/2 z-30 transition-opacity duration-150 pointer-events-none", swipeLeft ? "opacity-100" : "opacity-0")}>
          <div className="bg-black text-white p-2.5 rounded-full">
            <ThumbsDown size={20} strokeWidth={1.5} />
          </div>
        </div>
        <div className={cn("absolute right-3 top-1/2 -translate-y-1/2 z-30 transition-opacity duration-150 pointer-events-none", swipeRight ? "opacity-100" : "opacity-0")}>
          <div className="bg-black text-white p-2.5 rounded-full">
            <ThumbsUp size={20} strokeWidth={1.5} />
          </div>
        </div>

        {/* Card draggable — h-full para que ocupe el contenedor */}
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
            transition: dragging ? "none" : "transform 0.45s cubic-bezier(0.2,0.8,0.2,1), opacity 0.25s ease",
            cursor: dragging ? "grabbing" : "grab",
          }}
          className={cn(
            "w-full h-full bg-white rounded-[28px] overflow-hidden touch-none relative border border-black/10 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
            isLeaving && "opacity-0"
          )}
        >
          {/* Barra de progreso "Lo necesito" arriba */}
          {needFill > 0 && needFill < 100 && (
            <div className="absolute top-0 left-0 h-1 bg-foreground z-50 transition-none rounded-full" style={{ width: `${needFill}%` }} />
          )}

          {/* Imagen — 55% del alto */}
          <div
            className="relative w-full overflow-hidden flex items-center justify-center p-6"
            style={{ height: "55%", backgroundColor: product.image_color || "#f5f5f5" }}
          >


            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain pointer-events-none" />
            ) : (
              <span className="text-5xl grayscale pointer-events-none">📦</span>
            )}
          </div>

          {/* Info — resto del alto */}
          <div className="flex-1 px-5 py-4 flex flex-col justify-between bg-white">
            <div className="flex flex-col gap-1">
              {/* Etiquetas en una sola línea */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em]">{product.category}</span>
                <span className="text-black/20 text-[9px]">·</span>
                <span className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em]">{product.country}</span>
                <Link
                  href={`/producto/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Plus size={15} strokeWidth={2.5} />
                </Link>
              </div>
              <h2 className="text-xl font-black leading-tight tracking-tight text-black uppercase">
                {product.name}
              </h2>
              <p className="text-xs text-black/50 font-medium line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
            <div className="border-t border-black/5 pt-3">
              <DemandMeter value={product.demand} market={product.target_market} />
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="w-full shrink-0 flex items-center justify-between gap-3 px-1 pb-1">

        {/* PASO */}
        <button
          onPointerDown={() => startBtn("dislike")}
          onPointerUp={() => endBtn("dislike")}
          onPointerLeave={cancelHold}
          className="w-12 h-12 rounded-full border border-black/15 flex items-center justify-center active:scale-90 overflow-hidden relative transition-colors"
          style={{
            background: dislikeFill > 0 ? `linear-gradient(to top, #ef4444 ${dislikeFill}%, white ${dislikeFill}%)` : "white",
            color: dislikeFill > 60 ? "white" : "#ef4444",
            borderColor: dislikeFill > 0 ? "#ef4444" : "rgba(0,0,0,0.15)",
          }}
        >
          <ThumbsDown size={18} strokeWidth={1.5} className="relative z-10" />
        </button>

        {/* LO NECESITO — solo ícono de pausa */}
        <button
          onPointerDown={() => startBtn("need")}
          onPointerUp={() => endBtn("need")}
          onPointerLeave={cancelHold}
          className="w-12 h-12 rounded-full border flex items-center justify-center active:scale-95 overflow-hidden relative transition-colors"
          style={{
            background: needFill > 0 ? `linear-gradient(to right, #0a0a0a ${needFill}%, white ${needFill}%)` : "white",
            color: needFill > 50 ? "white" : "#0a0a0a",
            borderColor: needFill > 0 ? "#0a0a0a" : "rgba(0,0,0,0.15)",
          }}
        >
          {/* Ícono pausa: dos barras verticales */}
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" className="relative z-10">
            <rect x="0" y="0" width="4" height="16" rx="1.5" />
            <rect x="10" y="0" width="4" height="16" rx="1.5" />
          </svg>
        </button>

        {/* QUIERO */}
        <button
          onPointerDown={() => startBtn("like")}
          onPointerUp={() => endBtn("like")}
          onPointerLeave={cancelHold}
          className="w-12 h-12 rounded-full border border-black/15 flex items-center justify-center active:scale-90 overflow-hidden relative transition-colors"
          style={{
            background: likeFill > 0 ? `linear-gradient(to top, #22c55e ${likeFill}%, white ${likeFill}%)` : "white",
            color: likeFill > 60 ? "white" : "#22c55e",
            borderColor: likeFill > 0 ? "#22c55e" : "rgba(0,0,0,0.15)",
          }}
        >
          <ThumbsUp size={18} strokeWidth={1.5} className="relative z-10" />
        </button>
      </div>
    </div>
  );
}