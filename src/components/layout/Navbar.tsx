// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hook/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-6 h-14">
          <Link href="/" className="font-[family-name:var(--font-syne)] font-extrabold text-xl tracking-tight">
            <span className="text-foreground">404</span>
            <span className="text-[var(--color-brand)]">.</span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="text-xs font-medium border border-border rounded-full px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors">
              ES
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User size={13} /> {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={signOut}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-[var(--color-brand)] hover:opacity-90 text-white rounded-full px-5 h-8 text-sm font-medium"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}