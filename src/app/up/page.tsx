// src/app/subir/page.tsx
"use client";

import UploadForm from "@/components/product/UploadForm";
import { useRouter } from "next/navigation";

export default function SubirPage() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto flex items-start justify-center px-4 py-6">
      <div className="relative w-full max-w-md">
        {/* Sombra neobrutalist */}
        <div className="absolute inset-0 rounded-[32px] bg-black" style={{ translate: "6px 6px" }} />
        {/* Contenedor */}
        <div className="relative bg-white rounded-[32px] border-[3px] border-black overflow-hidden">
          <UploadForm onClose={() => router.push("/")} onSuccess={() => router.push("/")} inline />
        </div>
      </div>
    </div>
  );
}