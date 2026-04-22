// src/app/subir/page.tsx
"use client";

import UploadForm from "@/components/product/UploadForm";
import { useRouter } from "next/navigation";

export default function SubirPage() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto">
      <UploadForm onClose={() => router.push("/")} onSuccess={() => router.push("/")} inline />
    </div>
  );
}