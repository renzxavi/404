// src/components/layout/TabBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BarChart2, PlusCircle, Clock, ShoppingBag, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Descubrir", href: "/", icon: Compass },
  { label: "Ranking",   href: "/ranking", icon: BarChart2 },
  { label: "Up",     href: "/up", icon: PlusCircle },
  { label: "Historial", href: "/history", icon: Clock },
  { label: "brought",   href: "/brought", icon: ShoppingBag },
  { label: "Contact",  href: "/contact", icon: MessageSquare },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="grid grid-cols-6 h-16">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}