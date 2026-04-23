// src/components/product/SwipeCard.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Product } from "@/types/index";
import { cn } from "@/lib/utils";
import DemandMeter from "./DemandMeter";
import ProductDetail from "./ProductDetail";

const LONG_PRESS_MS = 600;
const THRESHOLD = 120;

interface SwipeCardProps {
  product: Product;
  onVote: (value: 1 | -1 | "need") => void;
}

export default function SwipeCard({ product, onVote }: SwipeCardProps) {
  const [dragging, setDragging] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [locked, setLocked]     = useState<"left"|"right"|"need"|null>(null);
  const [leaving, setLeaving]   = useState<"left"|"right"|"need"|null>(null);
  const [pressing, setPressing] = useState(false);
  const [needPct, setNeedPct]   = useState(0);

  const startPos   = useRef({ x: 0, y: 0 });
  const cardRef    = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number | null>(null);
  const pressStart = useRef(0);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const triggerVote = useCallback((direction: "left"|"right"|"need") => {
    setLeaving(direction);
    setNeedPct(0);
    setTimeout(() => {
      onVote(direction === "right" ? 1 : direction === "left" ? -1 : "need");
      setOffset({ x: 0, y: 0 });
      setLeaving(null);
      setLocked(null);
    }, direction === "need" ? 220 : 350);
  }, [onVote]);

  function clearPress() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setPressing(false);
    setNeedPct(0);
  }

  function animateNeed() {
    const tick = () => {
      const pct = Math.min(((Date.now() - pressStart.current) / LONG_PRESS_MS) * 100, 100);
      setNeedPct(pct);
      if (pct < 100) { rafRef.current = requestAnimationFrame(tick); }
      else { setLocked("need"); setPressing(false); }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("a") || (e.target as HTMLElement).closest("button")) return;
    if (locked) { triggerVote(locked); return; }
    setDragging(true);
    setPressing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    pressStart.current = Date.now();
    cardRef.current?.setPointerCapture(e.pointerId);
    animateNeed();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || locked) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) clearPress();
    setOffset({ x: dx, y: dy });
    if (dx > THRESHOLD) { setLocked("right"); setDragging(false); }
    else if (dx < -THRESHOLD) { setLocked("left"); setDragging(false); }
  }

  function onPointerUp() {
    clearPress();
    if (locked) return;
    setDragging(false);
    setOffset({ x: 0, y: 0 });
  }

  function getTransform() {
    if (leaving) {
      const x = leaving === "right" ? 1100 : leaving === "left" ? -1100 : 0;
      const y = leaving === "need" ? -2500 : 0;
      return `translate3d(${x}px,${y}px,0) rotate(${leaving === "need" ? -8 : x / 12}deg) scale(${leaving === "need" ? 0.5 : 1})`;
    }
    if (locked) {
      const x = locked === "left" ? -20 : locked === "right" ? 20 : 0;
      const r = locked === "left" ? -6 : locked === "right" ? 6 : 0;
      // "need" locked: flota hacia arriba
      const y = locked === "need" ? -24 : 0;
      return `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(1.03)`;
    }
    const scale = pressing ? 0.97 : 1;
    // Mientras carga "need", la card sube suavemente
    const needY = -(needPct / 100) * 18;
    return `translate3d(${offset.x}px,${offset.y + needY}px,0) rotate(${offset.x * 0.04}deg) scale(${scale})`;
  }

  const leftIntensity  = Math.min(Math.max(-offset.x / THRESHOLD, 0), 1);
  const rightIntensity = Math.min(Math.max(offset.x  / THRESHOLD, 0), 1);

  // Altura máxima de la card:
  // 100dvh - navbar(40) - tabbar(64) - categoryTabs(41) - margen(16) = ~439px
  // En pantallas grandes se limita a 600px
  const cardMaxH = "min(calc(100dvh - 40px - 64px - 41px - 48px), 460px)";
  // Ancho máximo proporcional al alto (ratio ~3:4)
  const cardMaxW = "min(calc((100dvh - 193px) * 0.62), 320px)";

  return (
    <div className="flex items-center justify-center w-full px-4">
      {/* Contenedor con tamaño fijo calculado */}
      <div
        className="relative"
        style={{ width: cardMaxW, height: cardMaxH }}
      >
        {/* Sombra neobrutalist */}
        <div
          className="absolute inset-0 rounded-[32px] bg-black pointer-events-none"
          style={{
            transform: getTransform(),
            transition: dragging ? "none" : leaving === "need"
              ? "transform 0.25s cubic-bezier(0.4,0,0.2,1)"
              : "transform 0.45s cubic-bezier(0.175,0.885,0.32,1.275)",
            translate: "6px 6px",
            opacity: leaving ? 0 : 1,
            zIndex: 0,
          }}
        />

        {/* CARD */}
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: getTransform(),
            transition: dragging ? "none" : leaving === "need"
              ? "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s"
              : "transform 0.45s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.25s",
            cursor: locked ? "pointer" : dragging ? "grabbing" : "grab",
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
          className={cn(
            "bg-white rounded-[32px] overflow-hidden touch-none border-[3px] border-black flex flex-col",
            leaving && "opacity-0"
          )}
        >
          {/* Barra need */}
          {needPct > 0 && needPct < 100 && (
            <div className="absolute top-0 left-0 z-50 h-[4px] bg-black rounded-full transition-none"
              style={{ width: `${needPct}%` }} />
          )}

          {/* OVERLAY PASO */}
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 pointer-events-none"
            style={{ opacity: locked === "left" ? 1 : leftIntensity, backgroundColor: "#FF3CAC" }}>
            <span className="text-[64px] leading-none" style={{ filter: "drop-shadow(3px 3px 0 black)" }}>🙅</span>
            <p className="text-3xl font-[950] tracking-tighter uppercase text-white text-center leading-none"
              style={{ textShadow: "3px 3px 0 black" }}>Acá no<br/>camina</p>
          </div>

          {/* OVERLAY QUIERO */}
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 pointer-events-none"
            style={{ opacity: locked === "right" ? 1 : rightIntensity, backgroundColor: "#C8F000" }}>
            <span className="text-[64px] leading-none" style={{ filter: "drop-shadow(3px 3px 0 black)" }}>🛒</span>
            <p className="text-3xl font-[950] tracking-tighter uppercase text-black text-center leading-none"
              style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}>¡Lo<br/>quiero!</p>
          </div>

          {/* OVERLAY NECESITO */}
          <div className={cn("absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 pointer-events-none transition-opacity duration-300",
            locked === "need" ? "opacity-100" : "opacity-0")}
            style={{ backgroundColor: "#2563FF" }}>
            <span className="text-[64px] leading-none" style={{ filter: "drop-shadow(3px 3px 0 black)" }}>✈️</span>
            <p className="text-3xl font-[950] tracking-tighter uppercase text-white text-center leading-none"
              style={{ textShadow: "3px 3px 0 black" }}>¡Lo<br/>necesito!</p>
          </div>

          {/* Imagen — 52% del alto de la card */}
          <div className="relative w-full flex items-center justify-center p-5"
            style={{ height: "52%", backgroundColor: product.image_color || "#f0f0f0" }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-contain pointer-events-none select-none" />
              : <span className="text-5xl pointer-events-none">📦</span>
            }
          </div>

          {/* Info */}
          <div className="flex-1 px-5 py-4 flex flex-col bg-white border-t-[3px] border-black overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 border-2 border-black rounded-full text-[9px] font-black uppercase tracking-tighter">
                  {product.country}
                </span>
                <span className="text-[9px] font-black text-black/30 uppercase tracking-tighter">
                  {product.category}
                </span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
                className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
            <h2 className="text-xl font-[950] leading-none tracking-tighter uppercase mb-1">
              {product.name}
            </h2>
            <p className="text-[11px] font-bold text-black/40 leading-tight line-clamp-2 uppercase">
              {product.description}
            </p>
            <div className="mt-auto pt-2 border-t-2 border-black/5">
              <DemandMeter value={product.demand} market={product.target_market} />
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <ProductDetail productId={product.id} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}