// src/app/layout.tsx
import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import TabBar from "@/components/layout/TabBar";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "404",
  description: "Descubrí productos del mundo que no llegan a Uruguay.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={syne.variable}>
      <body className="bg-background text-foreground antialiased overflow-hidden" style={{ height: "100dvh" }}>
        <Navbar />
        <main style={{ height: "calc(100dvh - 64px - 64px)", overflowY: "auto" }}>
          {children}
        </main>
        <TabBar />
      </body>
    </html>
  );
}