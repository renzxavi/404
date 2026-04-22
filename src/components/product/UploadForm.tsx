// src/components/product/UploadForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Camera, Check, ChevronDown, Loader2 } from "lucide-react";
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
    // Imagen obligatoria
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
    <div className="flex flex-col gap-6">

      {/* Imagen — obligatoria, se marca en rojo si falta */}
      <div className="group relative">
        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 mb-2 flex items-center gap-1 ml-1">
          Imagen del producto
          <span className="text-destructive">*</span>
        </label>
        <label className={`
          relative flex flex-col items-center justify-center aspect-video w-full
          border-2 border-dashed rounded-[2rem] transition-all duration-300 cursor-pointer overflow-hidden
          ${imagePreview ? "border-transparent" : error && !imageFile ? "border-destructive/50 bg-destructive/5" : "border-border hover:border-foreground/20 hover:bg-muted/30"}
        `}>
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-medium bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">Cambiar imagen</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${error && !imageFile ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                <Camera size={24} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Subir foto</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">JPG, PNG o WebP · Máx 8 MB</span>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
      </div>

      {/* Nombre */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 mb-2 block ml-1">
          Nombre <span className="text-destructive">*</span>
        </label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Matcha Kit Kat"
          className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-sm outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all placeholder:text-muted-foreground/50" />
      </div>

      {/* Descripción */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 mb-2 block ml-1">
          Descripción
        </label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Qué lo hace especial?" rows={3}
          className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-sm outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all resize-none" />
      </div>

      {/* País + Categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 mb-2 block ml-1">
            Origen <span className="text-destructive">*</span>
          </label>
          <input value={countrySearch}
            onChange={(e) => { setCountrySearch(e.target.value); setShowCountries(true); }}
            onFocus={() => setShowCountries(true)}
            placeholder={loadingCountries ? "..." : "Buscar país"}
            className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-sm outline-none focus:ring-4 focus:ring-foreground/5 transition-all" />
          {showCountries && filteredCountries.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-[60] max-h-48 overflow-y-auto p-2">
              {filteredCountries.map((c) => (
                <button key={c.code} onClick={() => { setCountry(c.code); setCountrySearch(c.name); setShowCountries(false); }}
                  className="w-full flex items-center justify-between px-3 py-3 text-sm hover:bg-muted rounded-xl transition-colors text-left">
                  <span>{c.flag} {c.name}</span>
                  {country === c.code && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 mb-2 block ml-1">
            Categoría <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-sm outline-none focus:ring-4 focus:ring-foreground/5 appearance-none cursor-pointer transition-all">
              <option value="">Seleccionar</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 p-3 rounded-xl border border-destructive/20">
          <p className="text-xs text-destructive font-medium text-center">{error}</p>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full rounded-2xl bg-foreground px-6 py-5 text-sm font-bold uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="animate-spin" size={18} /> Subiendo...</> : "Publicar producto"}
      </button>
    </div>
  );

  if (inline) return (
    <div className="px-6 py-8 max-w-lg mx-auto">
      <header className="mb-8">
        <h2 className="font-[family-name:var(--font-syne)] font-bold text-3xl tracking-tight">Subir producto</h2>
        <p className="text-muted-foreground text-sm mt-1">Compartí un nuevo descubrimiento con la comunidad.</p>
      </header>
      {fields}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 bg-background w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[95dvh] overflow-hidden flex flex-col">
        <div className="sm:hidden w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2" />
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-2xl tracking-tight">Subir producto</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-10">{fields}</div>
      </div>
    </div>
  );
}