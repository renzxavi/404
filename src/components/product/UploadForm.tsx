// src/components/product/UploadForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";
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
}

export default function UploadForm({ onClose, onSuccess }: UploadFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountries, setShowCountries] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [category, setCategory] = useState<Category | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageColor] = useState(IMAGE_COLORS[Math.floor(Math.random() * IMAGE_COLORS.length)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingCountries(true);
    fetchCountries()
      .then(setCountries)
      .finally(() => setLoadingCountries(false));
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
  }

  async function handleSubmit() {
    if (!name || !description || !country || !category) {
      setError("Completá todos los campos");
      return;
    }
    setLoading(true);
    setError("");

    try {
      let image_url: string | undefined;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      const { data: { session } } = await supabase.auth.getSession();

      const { error: insertError } = await supabase.from("products").insert({
        name,
        description,
        country,
        category,
        image_url,
        image_color: imageColor,
        status: 1,
        target_market: "Uruguay",
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-background w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-2xl">Subir producto</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Nombre */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Matcha Kit Kat..."
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Imagen</label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="h-24 w-24 object-cover rounded-xl" />
              ) : (
                <>
                  <Camera size={28} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tocá para elegir</span>
                  <span className="text-xs text-muted-foreground">JPG · PNG · WebP · máx 8 MB</span>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qué es, para qué sirve, cómo se experimenta..."
              rows={3}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all resize-none"
            />
          </div>

          {/* País */}
          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">País de Origen</label>
            <input
              value={countrySearch}
              onChange={(e) => { setCountrySearch(e.target.value); setShowCountries(true); }}
              onFocus={() => setShowCountries(true)}
              placeholder={loadingCountries ? "Cargando países..." : "Buscar país..."}
              disabled={loadingCountries}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all disabled:opacity-50"
            />
            {showCountries && filteredCountries.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg z-10 max-h-36 overflow-y-auto">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCountry(c.code); setCountrySearch(c.name); setShowCountries(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-all appearance-none"
            >
              <option value="">Seleccionar...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-foreground text-background font-bold uppercase tracking-widest py-4 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? "Subiendo..." : "Enviar a descubrimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}   