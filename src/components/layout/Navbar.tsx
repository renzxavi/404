"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hook/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { LogOut, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          
          {/* Logo - Refined heavy geometric style */}
          <Link href="/" className="group flex items-center gap-1">
            <span className="text-2xl font-[900] tracking-tighter text-black transition-opacity group-hover:opacity-70">
              404<span className="text-black/30">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            {/* Language Selector - Minimalist style */}
            <button className="hidden md:flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-black/40 hover:text-black transition-colors uppercase">
              <Globe size={13} strokeWidth={2.5} />
              EN
              <ChevronDown size={10} strokeWidth={3} className="opacity-50" />
            </button>

            <div className="h-4 w-[1px] bg-black/10 hidden md:block" />

            {user ? (
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-black uppercase text-black tracking-widest">
                    {user.email?.split("@")[0]}
                  </span>
                  <span className="text-[9px] text-black/40 font-semibold uppercase tracking-tighter">
                    Account
                  </span>
                </div>
                
                <button 
                  onClick={signOut} 
                  className="group w-10 h-10 rounded-full border border-black/5 flex items-center justify-center bg-black/[0.02] hover:bg-black hover:text-white transition-all duration-300"
                  aria-label="Sign out"
                >
                  <LogOut size={14} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              /* CTA Button - High contrast, polished */
              <button
                onClick={() => setShowAuth(true)}
                className={cn(
                  "relative h-10 px-8 text-[11px] font-bold uppercase tracking-[0.15em]",
                  "bg-black text-white rounded-full overflow-hidden",
                  "transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
                  "active:scale-[0.97] shrink-0"
                )}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}