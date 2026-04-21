"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BarChart2, PlusCircle, Clock, ShoppingBag, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Explore", href: "/", icon: Compass },
  { label: "Ranking", href: "/ranking", icon: BarChart2 },
  { label: "Post",    href: "/up", icon: PlusCircle },
  { label: "History", href: "/history", icon: Clock },
  { label: "Orders",  href: "/brought", icon: ShoppingBag },
  { label: "Contact",    href: "/contact", icon: MessageSquare },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="grid grid-cols-6 h-16 max-w-lg mx-auto px-1">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 transition-all duration-300",
                active ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground"
              )}
            >
              {/* Active indicator bar */}
              <div className={cn(
                "absolute top-0 h-1 w-8 rounded-b-full transition-all duration-300 bg-foreground",
                active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              )} />

              <div className={cn(
                "p-1.5 rounded-2xl transition-all duration-300",
                active ? "bg-foreground/5 scale-110" : "bg-transparent"
              )}>
                <Icon 
                  size={20} 
                  strokeWidth={active ? 2.5 : 1.5} 
                  className={cn("transition-transform", active && "scale-105")}
                />
              </div>
              
              <span className={cn(
                "text-[9px] font-bold tracking-tighter uppercase transition-all duration-300",
                active ? "opacity-100 scale-100" : "opacity-60 scale-95"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}