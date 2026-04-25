// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hook/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  function handleAuthClose() {
    setShowAuth(false);
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white" style={{ borderBottom: "1px solid #ebebeb", height: "64px" }}>
        <div className="flex items-center justify-between h-full px-6">

          {/* LOGO */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 900, fontSize: "26px", color: "#111111", letterSpacing: "-0.03em", lineHeight: 1 }}>
              404<span style={{ color: "#4a90e2" }}>.</span>
            </span>
          </Link>

          {/* RIGHT */}
          <div className="flex items-center gap-2.5">

            {/* EN pill — neobrutalist */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 rounded-full bg-black" style={{ translate: "2px 2px" }} />
              <button className="relative flex items-center justify-center border-[2px] border-black rounded-full bg-white"
                style={{ fontFamily: "'Unbounded', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", color: "#1a1a1a", padding: "6px 14px", height: "34px" }}>
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2.5">
                {/* Avatar — neobrutalist */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-black" style={{ translate: "2px 2px" }} />
                  <div className="relative border-[2px] border-black rounded-full flex items-center justify-center"
                    style={{ width: "38px", height: "38px", backgroundColor: "#4a90e2", fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Sign out — neobrutalist (CORREGIDO A ROJO) */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-black" style={{ translate: "2px 2px" }} />
                  <button 
                    onClick={handleSignOut}
                    className="relative flex items-center justify-center border-[2px] border-black rounded-full bg-white hover:bg-red-500 hover:text-white transition-all duration-200 active:translate-x-[1px] active:translate-y-[1px]"
                    style={{ width: "34px", height: "34px", color: "#1a1a1a" }}
                    aria-label="Sign out">
                    <LogOut size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ) : (
              /* Sign In — neobrutalist */
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-black" style={{ translate: "3px 3px" }} />
                <button onClick={() => setShowAuth(true)}
                  className="relative border-[2px] border-black rounded-full flex items-center justify-center transition-all hover:opacity-85 active:translate-x-[1px] active:translate-y-[1px]"
                  style={{ backgroundColor: "#4a90e2", color: "#ffffff", padding: "0 20px", height: "38px", fontFamily: "'Unbounded', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={handleAuthClose} />}
    </>
  );
}