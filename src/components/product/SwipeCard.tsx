"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types/index";
import { cn } from "@/lib/utils";
import DemandMeter from "./DemandMeter";

const LONG_PRESS_MS = 600;
const THRESHOLD = 160;

interface SwipeCardProps {
  product: Product;
  onVote: (value: 1 | -1 | "need") => void;
}

export default function SwipeCard({ product, onVote }: SwipeCardProps) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [locked, setLocked] = useState<"left" | "right" | "need" | null>(null);
  const [leaving, setLeaving] = useState<"left" | "right" | "need" | null>(null);
  const [pressing, setPressing] = useState(false);
  const [needPct, setNeedPct] = useState(0);

  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pressStart = useRef(0);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const triggerVote = useCallback((direction: "left" | "right" | "need") => {
    setLeaving(direction);
    setNeedPct(0);
    const duration = direction === "need" ? 600 : 350;

    setTimeout(() => {
      onVote(direction === "right" ? 1 : direction === "left" ? -1 : "need");
      setOffset({ x: 0, y: 0 });
      setLeaving(null);
      setLocked(null);
    }, duration);
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
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setLocked("need");
        setPressing(false);
      }
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
    if (Math.abs(dx) > 15 || Math.abs(dy) > 15) clearPress();
    setOffset({ x: dx, y: dy });
    if (dx > THRESHOLD) { setLocked("right"); setDragging(false); clearPress(); }
    else if (dx < -THRESHOLD) { setLocked("left"); setDragging(false); clearPress(); }
  }

  function onPointerUp() {
    clearPress();
    if (locked) return;
    setDragging(false);
    setOffset({ x: 0, y: 0 });
  }

  function getTransform() {
    if (leaving) {
      if (leaving === "need") return `translate3d(0, -2000px, 0) scale(0) rotate(-10deg)`;
      const x = leaving === "right" ? 1200 : -1200;
      return `translate3d(${x}px, 0, 0) rotate(${x / 12}deg) scale(0.5)`;
    }
    if (locked) {
      const x = locked === "left" ? -30 : locked === "right" ? 30 : 0;
      const y = locked === "need" ? -60 : 0; 
      const r = locked === "left" ? -8 : locked === "right" ? 8 : 0;
      return `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(1.04)`;
    }
    const scale = pressing ? 0.96 : 1;
    const needY = -(needPct / 100) * 40; 
    return `translate3d(${offset.x}px, ${offset.y + needY}px, 0) rotate(${offset.x * 0.04}deg) scale(${scale})`;
  }

  const getTransition = () => {
    if (dragging) return "none";
    if (leaving === "need") return "transform 0.7s cubic-bezier(0.5, 0, 1, 0.5), opacity 0.4s";
    return "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s";
  };

  const leftIntensity = Math.min(Math.max(-offset.x / THRESHOLD, 0), 1);
  const rightIntensity = Math.min(Math.max(offset.x / THRESHOLD, 0), 1);

  return (
    // Contenedor principal usa flex-1 para ocupar el espacio disponible sin desbordar
    <div className="flex-1 w-full flex items-center justify-center p-4 min-h-0">
      <div 
        className="relative w-full max-w-[340px] aspect-[3/4.2]" 
        style={{ maxHeight: "calc(100vh - 250px)" }} // Garantiza que no choque con headers/footers
      >
        {/* SOMBRA */}
        <div
          className="absolute inset-0 rounded-[35px] bg-black pointer-events-none"
          style={{
            transform: getTransform(),
            transition: getTransition(),
            translate: "8px 8px",
            opacity: leaving ? 0 : 1,
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
            transition: getTransition(),
            cursor: locked ? "pointer" : dragging ? "grabbing" : "grab",
            zIndex: 1,
          }}
          className={cn(
            "w-full h-full bg-white rounded-[35px] overflow-hidden touch-none border-[3px] border-black flex flex-col relative shadow-sm",
            leaving && "opacity-0 pointer-events-none"
          )}
        >
          {/* BARRA CARGA */}
          {needPct > 0 && needPct < 100 && (
            <div className="absolute top-0 left-0 z-50 h-[8px] bg-black"
              style={{ width: `${needPct}%` }} />
          )}

          {/* OVERLAYS (Acá no camina, Lo quiero, Lo necesito) */}
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 gap-4 pointer-events-none"
            style={{ opacity: locked === "left" ? 1 : leftIntensity, backgroundColor: "#FF70CD" }}>
            <div className="w-16 h-16 border-[6px] border-black rounded-full flex items-center justify-center bg-white/20">
               <div className="w-10 h-[6px] bg-black rotate-45" />
            </div>
            <h2 className="text-3xl font-[950] tracking-tighter uppercase text-black italic text-center leading-none">Acá no<br/>camina</h2>
          </div>

          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 gap-4 pointer-events-none"
            style={{ opacity: locked === "right" ? 1 : rightIntensity, backgroundColor: "#D2FF32" }}>
            <span className="text-7xl animate-bounce">🛒</span>
            <h2 className="text-3xl font-[950] tracking-tighter uppercase text-black text-center leading-none">¡Lo<br/>quiero!</h2>
          </div>

          <div className={cn("absolute inset-0 z-40 flex flex-col items-center justify-center p-6 gap-4 pointer-events-none transition-all duration-300 bg-[#2563FF]",
            locked === "need" ? "opacity-100 scale-100" : "opacity-0 scale-90")}>
            <span className="text-7xl animate-pulse">✈️</span>
            <h2 className="text-3xl font-[950] tracking-tighter uppercase text-white text-center italic leading-none">¡Lo<br/>necesito!</h2>
          </div>

          {/* CONTENIDO SUPERIOR (Imagen) - Reducido un poco para dar aire al texto */}
          <div className="relative w-full flex items-center justify-center p-8 bg-[#f3f3f3]" style={{ height: "50%" }}>
            <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain pointer-events-none select-none" />
          </div>

          {/* INFO INFERIOR - Con flex-grow para asegurar que el DemandMeter esté al final */}
          <div className="flex-1 px-5 py-5 flex flex-col bg-white border-t-[3px] border-black min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 border-2 border-black rounded-full text-[9px] font-[900] uppercase bg-gray-50">{product.country}</span>
              <Link href={`/producto/${product.id}`} onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white"><Plus size={18} strokeWidth={4} /></Link>
            </div>
            
            <h2 className="text-xl font-[950] leading-[1] uppercase mb-1 line-clamp-1">{product.name}</h2>
            <p className="text-[10px] font-bold text-black/40 leading-tight uppercase line-clamp-2 mb-2">{product.description}</p>
            
            <div className="mt-auto pt-2 border-t border-black/5">
              <DemandMeter value={product.demand} market={product.target_market} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}