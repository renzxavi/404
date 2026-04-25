// src/components/layout/TabBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hook/useAuth";

const allTabs = [
  {
    label: "Descubrir", href: "/", auth: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.5}>
        <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Ranking", href: "/ranking", auth: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.5} strokeLinecap="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    label: "Subir", href: "/up", auth: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.5} strokeLinecap="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Historial", href: "/history", auth: true,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.5} strokeLinecap="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 3.5" />
      </svg>
    ),
  },
  {
    label: "Traídos", href: "/brought", auth: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: "Contacto", href: "/contact", auth: false,
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const tabs = allTabs.filter(t => !t.auth || !!user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white" style={{ borderTop: "1px solid #ebebeb", height: "64px" }}>
      <div className="h-full" style={{ display: "grid", gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(({ label, href, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
            >
              {/* Ícono con pill neobrutalist cuando está activo */}
              <div className="relative flex items-center justify-center">
                {active && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-black" style={{ translate: "2px 2px" }} />
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white border-[2px] border-black"
                      style={{ color: "#1a1a1a" }}>
                      {icon(active)}
                    </div>
                  </>
                )}
                {!active && (
                  <div style={{ color: "#aaaaaa" }}>
                    {icon(active)}
                  </div>
                )}
              </div>
              <span style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: "7px",
                fontWeight: active ? 700 : 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: active ? "#1a1a1a" : "#aaaaaa",
                lineHeight: 1,
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}