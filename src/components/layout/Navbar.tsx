"use client";

// Design replication from index5.html — #header
// Font logo: Unbounded weight 900 — matches .logo class
// Background: white (#ffffff) — clean white header
// Border-bottom: 1px solid #ebebeb — subtle separator
// Height: ~64px — matches reference header height
// Logo dot: color #4a90e2 (blue dot in reference image)
// Right side: EN pill (outlined rounded), filled blue button or user avatar

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hook/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #ebebeb",
          height: "64px",
        }}
      >
        <div
          className="flex items-center justify-between h-full"
          style={{
            padding: "0 24px",
            maxWidth: "100%",
          }}
        >
          {/* ── LOGO ─────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "'Unbounded', sans-serif",
                fontWeight: 900,
                fontSize: "26px",
                color: "#111111",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              404
              <span style={{ color: "#4a90e2" }}>.</span>
            </span>
          </Link>

          {/* ── RIGHT SIDE CONTROLS ──────────────────────────────── */}
          <div className="flex items-center" style={{ gap: "10px" }}>

            {/* Language pill — "EN" */}
            <button
              className="hidden md:flex items-center justify-center"
              style={{
                border: "1.5px solid #1a1a1a",
                borderRadius: "999px",
                padding: "6px 14px",
                backgroundColor: "transparent",
                fontFamily: "'Unbounded', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#1a1a1a",
                cursor: "pointer",
                height: "34px",
              }}
            >
              EN
            </button>

            {user ? (
              /* ── LOGGED IN: avatar circle + sign out ── */
              <div className="flex items-center" style={{ gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "#4a90e2",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Unbounded', sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  {user.email?.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={signOut}
                  className="flex items-center justify-center"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "1.5px solid #e0e0e0",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    color: "#1a1a1a",
                  }}
                  aria-label="Sign out"
                >
                  <LogOut size={14} strokeWidth={2} />
                </button>
              </div>
            ) : (
              /* ── LOGGED OUT: filled blue "Sign In" button ── */
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  backgroundColor: "#4a90e2",
                  color: "#ffffff",
                  borderRadius: "999px",
                  border: "none",
                  padding: "0 20px",
                  height: "38px",
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
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