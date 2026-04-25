// src/components/product/UploadForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Camera, ChevronDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";
import { Category } from "@/types/index";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "FOOD", label: "Comida & Bebida" },
  { value: "TECH", label: "Tecnología" },
  { value: "BEAUTY", label: "Belleza & Cuidado" },
  { value: "FASHION", label: "Moda" },
  { value: "HOME", label: "Hogar" },
  { value: "SPORT", label: "Deporte" },
  { value: "OTHER", label: "Otro" },
];

const IMAGE_COLORS = ["#c8f000", "#ff6b6b", "#4ecdc4", "#ffe66d", "#a8edea", "#fed6e3", "#d299c2"];

interface UploadFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  inline?: boolean;
}

export default function UploadForm({ onClose, onSuccess, inline = false }: UploadFormProps) {
  const [name, setName]                         = useState("");
  const [description, setDescription]           = useState("");
  const [country, setCountry]                   = useState("");
  const [countrySearch, setCountrySearch]       = useState("");
  const [showCountries, setShowCountries]       = useState(false);
  const [countries, setCountries]               = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [category, setCategory]                 = useState<Category | "">("");
  const [imageFile, setImageFile]               = useState<File | null>(null);
  const [imagePreview, setImagePreview]         = useState<string | null>(null);
  const [imageColor]                            = useState(IMAGE_COLORS[Math.floor(Math.random() * IMAGE_COLORS.length)]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");

  useEffect(() => {
    setLoadingCountries(true);
    fetchCountries().then(setCountries).finally(() => setLoadingCountries(false));
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("La imagen no puede superar 8 MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit() {
    if (!imageFile) { setError("La imagen es obligatoria"); return; }
    if (!name || !country || !category) { setError("Completá todos los campos"); return; }
    setLoading(true);
    setError("");
    try {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, imageFile, { upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      const image_url = data.publicUrl;
      const { data: { session } } = await supabase.auth.getSession();
      const { error: insertError } = await supabase.from("products").insert({
        name, description, country, category, image_url,
        image_color: imageColor, status: 1, target_market: "Uruguay",
        created_by: session?.user?.id ?? null,
      });
      if (insertError) throw insertError;
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir el producto");
    } finally {
      setLoading(false);
    }
  }

  const fields = (
    <div className="flex flex-col gap-5">

      {/* Imagen */}
      <div className="group relative">
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
          Imagen <span className="text-[#FF3CAC]">*</span>
        </label>
        <label className="relative flex flex-col items-center justify-center aspect-video w-full border-[2.5px] border-dashed border-black rounded-[20px] cursor-pointer overflow-hidden hover:bg-black/5 transition-colors">
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-black uppercase tracking-wider bg-black/40 px-4 py-2 rounded-full">Cambiar</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-[2.5px] border-black flex items-center justify-center">
                <Camera size={20} strokeWidth={2.5} />
              </div>
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider block">Subir foto</span>
                <span className="text-[10px] text-black/40 uppercase tracking-tight">JPG, PNG · Máx 8 MB</span>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
      </div>

      {/* Nombre */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 block">
          Nombre <span className="text-[#FF3CAC]">*</span>
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Matcha Kit Kat"
          className="w-full rounded-2xl border-[2.5px] border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-black/5 transition-all placeholder:text-black/30" />
      </div>

      {/* Descripción */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-widest mb-2 block">Descripción</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Qué lo hace especial?" rows={3}
          className="w-full rounded-2xl border-[2.5px] border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-black/5 transition-all resize-none placeholder:text-black/30" />
      </div>

      {/* País + Categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className="text-[9px] font-black uppercase tracking-widest mb-2 block">
            Origen <span className="text-[#FF3CAC]">*</span>
          </label>
          <div className="relative">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={loadingCountries}
              className="w-full rounded-2xl border-[2.5px] border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-black/5 appearance-none cursor-pointer transition-all disabled:opacity-50"
            >
              <option value="">Seleccionar...</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={3} />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black uppercase tracking-widest mb-2 block">
            Categoría <span className="text-[#FF3CAC]">*</span>
          </label>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-2xl border-[2.5px] border-black bg-white px-4 py-3 text-sm font-bold outline-none focus:bg-black/5 appearance-none cursor-pointer transition-all">
              <option value="">Seleccionar</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={3} />
          </div>
        </div>
      </div>

      {error && (
        <div className="border-[2.5px] border-[#FF3CAC] bg-[#FF3CAC]/10 p-3 rounded-2xl">
          <p className="text-xs font-black text-[#FF3CAC] text-center uppercase tracking-wider">{error}</p>
        </div>
      )}

      {/* Botón con sombra neobrutalist */}
      <div className="relative mt-2">
        <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "4px 4px" }} />
        <button onClick={handleSubmit} disabled={loading}
          className="relative w-full rounded-2xl bg-black text-white px-6 py-4 text-sm font-black uppercase tracking-[0.2em] hover:bg-black/80 active:translate-x-1 active:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2 transition-all border-[2.5px] border-black">
          {loading ? <><Loader2 className="animate-spin" size={16} /> Subiendo...</> : "Publicar producto"}
        </button>
      </div>
    </div>
  );

  if (inline) return (
    <div className="px-5 py-6 max-w-lg mx-auto">
      <div className="mb-6">
      </div>
      {fields}
    </div>
  );

  // Modal
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg">
        <div className="absolute inset-0 rounded-[32px] bg-black" style={{ translate: "6px 6px" }} />
        <div className="relative bg-white rounded-[32px] border-[3px] border-black overflow-hidden max-h-[92dvh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b-[3px] border-black shrink-0">
            <h2 className="font-[family-name:var(--font-syne)] font-black text-xl tracking-tighter uppercase">Subir producto</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full border-[2.5px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-all">
              <X size={16} strokeWidth={3} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{fields}</div>
        </div>
      </div>
    </div>
  );
}