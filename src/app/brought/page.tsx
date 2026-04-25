// src/app/brought/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCountries, Country } from "@/lib/countries";
import { Product } from "@/types/index";
import { CheckCircle2, ThumbsUp, ThumbsDown, Bookmark, Shield, Trash2, MessageSquare, User, Package, Star } from "lucide-react";
import { useAuth } from "@/hook/useAuth";

type AdminTab = "productos" | "comentarios" | "usuarios";
type UserTab  = "importados" | "mis-votos";

interface Comment { id: string; body: string; product_id: string; user_id: string; created_at: string; }
interface Profile { id: string; email: string; role: string; country: string; }

export default function TraidosPage() {
  const { user } = useAuth();
  const [products, setProducts]       = useState<Product[]>([]);
  const [pending, setPending]         = useState<Product[]>([]);
  const [countries, setCountries]     = useState<Country[]>([]);
  const [myVotes, setMyVotes]         = useState<Record<string, number>>({});
  const [isAdmin, setIsAdmin]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [approving, setApproving]     = useState<string | null>(null);
  const [adminTab, setAdminTab]       = useState<AdminTab>("productos");
  const [userTab, setUserTab]         = useState<UserTab>("importados");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [comments, setComments]       = useState<Comment[]>([]);
  const [profiles, setProfiles]       = useState<Profile[]>([]);
  const [deleting, setDeleting]       = useState<string | null>(null);

  // Importados que el usuario ayudó a votar positivamente
  const importedIVotedFor = products.filter(p =>
    myVotes[p.id] === 1 || myVotes[p.id] === 2
  );
  const importedIVotedAgainst = products.filter(p => myVotes[p.id] === -1);
  const importedNoVote = products.filter(p => !myVotes[p.id]);

  useEffect(() => {
    async function load() {
      const [importedRes, ctrs] = await Promise.all([
        supabase.from("products").select("*").eq("status", 2).order("created_at", { ascending: false }),
        fetchCountries(),
      ]);
      if (importedRes.data) setProducts(importedRes.data as Product[]);
      setCountries(ctrs);

      if (user) {
        const [profileRes, votesRes] = await Promise.all([
          supabase.from("profiles").select("role").eq("id", user.id).single(),
          supabase.from("votes").select("product_id, value").eq("user_id", user.id),
        ]);

        if (profileRes.data?.role === "admin") {
          setIsAdmin(true);
          const [pendingRes, allProdRes, commentsRes, profilesRes] = await Promise.all([
            supabase.from("products").select("*").eq("status", 1).order("demand", { ascending: false }),
            supabase.from("products").select("*").order("created_at", { ascending: false }),
            supabase.from("comments").select("*").order("created_at", { ascending: false }),
            supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          ]);
          if (pendingRes.data)  setPending(pendingRes.data as Product[]);
          if (allProdRes.data)  setAllProducts(allProdRes.data as Product[]);
          if (commentsRes.data) setComments(commentsRes.data as Comment[]);
          if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
        }

        if (votesRes.data) {
          const map: Record<string, number> = {};
          votesRes.data.forEach((v: { product_id: string; value: number }) => { map[v.product_id] = v.value; });
          setMyVotes(map);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  async function approveImport(productId: string) {
    setApproving(productId);
    await supabase.from("imports").insert({ product_id: productId, marked_by: user!.id });
    const product = pending.find(p => p.id === productId);
    if (product) {
      setPending(prev => prev.filter(p => p.id !== productId));
      setProducts(prev => [{ ...product, status: 2 }, ...prev]);
    }
    setApproving(null);
  }

  async function deleteProduct(id: string) {
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setAllProducts(prev => prev.filter(p => p.id !== id));
    setProducts(prev => prev.filter(p => p.id !== id));
    setPending(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  async function deleteComment(id: string) {
    setDeleting(id);
    await supabase.from("comments").delete().eq("id", id);
    setComments(prev => prev.filter(c => c.id !== id));
    setDeleting(null);
  }

  async function deleteUser(id: string) {
    setDeleting(id);
    await supabase.from("profiles").delete().eq("id", id);
    setProfiles(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  function getCountry(code: string) { return countries.find(c => c.code === code); }

  function voteBadge(v: number) {
    if (v === 1)  return { text: "Voté quiero",   cls: "bg-[#C8F000] text-black", icon: <ThumbsUp size={10} /> };
    if (v === 2)  return { text: "Lo necesitaba", cls: "bg-[#2563FF] text-white", icon: <Bookmark size={10} /> };
    if (v === -1) return { text: "Voté paso",     cls: "bg-[#FF3CAC] text-white", icon: <ThumbsDown size={10} /> };
    return null;
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
    </div>
  );

  const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} disabled={!!deleting}
      className="w-8 h-8 rounded-xl border-[2px] border-black bg-[#FF3CAC] text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0">
      <Trash2 size={13} strokeWidth={2.5} />
    </button>
  );

  const ProductRow = ({ p, badge }: { p: Product; badge?: ReturnType<typeof voteBadge> }) => {
    const country = getCountry(p.country);
    return (
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
        <div className="relative bg-white rounded-2xl p-3 flex items-center gap-3 border-[2.5px] border-black">
          <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-black"
            style={{ backgroundColor: p.image_color }}>
            {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" /> : <span>📦</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{p.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{country?.flag} {country?.name ?? p.country} · {p.category}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <CheckCircle2 size={16} className="text-green-500" />
            {badge && (
              <span className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full border-[1.5px] border-black ${badge.cls}`}>
                {badge.icon} {badge.text}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border shrink-0">
        <CheckCircle2 size={18} />
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-lg">Traídos</h1>
        <span className="ml-auto text-xs text-muted-foreground">Importados a Uruguay</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <div className="flex flex-col gap-6 max-w-sm mx-auto">

          {/* APROBAR — solo admin */}
          {isAdmin && pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-[#2563FF]" />
                <h2 className="text-[9px] font-black uppercase tracking-widest text-[#2563FF]">Aprobar ({pending.length})</h2>
              </div>
              <div className="flex flex-col gap-2">
                {pending.map(p => {
                  const country = getCountry(p.country);
                  return (
                    <div key={p.id} className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
                      <div className="relative bg-white rounded-2xl p-3 flex items-center gap-3 border-[2.5px] border-[#2563FF]">
                        <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-black" style={{ backgroundColor: p.image_color }}>
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" /> : <span>📦</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-[family-name:var(--font-syne)] font-bold text-sm truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{country?.flag} {country?.name ?? p.country} · {Math.round(p.demand)}%</p>
                        </div>
                        <button onClick={() => approveImport(p.id)} disabled={approving === p.id}
                          className="shrink-0 flex items-center gap-1 bg-black text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl hover:opacity-80 disabled:opacity-50">
                          {approving === p.id ? "..." : <><CheckCircle2 size={11} /> Aprobar</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CRUD — solo admin */}
          {isAdmin && (
            <div className="relative">
              <div className="absolute inset-0 rounded-[24px] bg-black" style={{ translate: "5px 5px" }} />
              <div className="relative bg-white rounded-[24px] border-[3px] border-black p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} />
                  <h2 className="text-[9px] font-black uppercase tracking-widest">Administración</h2>
                </div>
                <div className="flex border-[2.5px] border-black rounded-2xl overflow-hidden mb-3">
                  {([
                    { id: "productos",   label: "Productos",   icon: <Package size={11} /> },
                    { id: "comentarios", label: "Comentarios", icon: <MessageSquare size={11} /> },
                    { id: "usuarios",    label: "Usuarios",    icon: <User size={11} /> },
                  ] as { id: AdminTab; label: string; icon: React.ReactNode }[]).map((t, i) => (
                    <button key={t.id} onClick={() => setAdminTab(t.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[8px] font-black uppercase tracking-wider transition-all"
                      style={{ backgroundColor: adminTab === t.id ? "#1a1a1a" : "white", color: adminTab === t.id ? "white" : "#1a1a1a", borderRight: i < 2 ? "2.5px solid black" : "none" }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {adminTab === "productos" && (
                  <div className="flex flex-col gap-2">
                    {allProducts.length === 0 ? <p className="text-xs text-center py-4 text-muted-foreground">Sin productos.</p>
                      : allProducts.map(p => (
                        <div key={p.id} className="relative">
                          <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
                          <div className="relative bg-white rounded-2xl p-3 flex items-center gap-3 border-[2.5px] border-black">
                            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-black" style={{ backgroundColor: p.image_color }}>
                              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" /> : <span>📦</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate">{p.name}</p>
                              <p className="text-[9px] text-muted-foreground uppercase">{p.country} · {p.status === 2 ? "✓ Importado" : "Activo"}</p>
                            </div>
                            <DeleteBtn onClick={() => deleteProduct(p.id)} />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {adminTab === "comentarios" && (
                  <div className="flex flex-col gap-2">
                    {comments.length === 0 ? <p className="text-xs text-center py-4 text-muted-foreground">Sin comentarios.</p>
                      : comments.map(c => (
                        <div key={c.id} className="relative">
                          <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
                          <div className="relative bg-white rounded-2xl p-3 flex items-start gap-3 border-[2.5px] border-black">
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-black uppercase text-[#2563FF] mb-1">{c.user_id.slice(0, 8)}</p>
                              <p className="text-xs font-bold text-black/80">{c.body}</p>
                              <p className="text-[9px] text-black/30 mt-1">{new Date(c.created_at).toLocaleDateString("es-UY")}</p>
                            </div>
                            <DeleteBtn onClick={() => deleteComment(c.id)} />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {adminTab === "usuarios" && (
                  <div className="flex flex-col gap-2">
                    {profiles.length === 0 ? <p className="text-xs text-center py-4 text-muted-foreground">Sin usuarios.</p>
                      : profiles.map(p => (
                        <div key={p.id} className="relative">
                          <div className="absolute inset-0 rounded-2xl bg-black" style={{ translate: "3px 3px" }} />
                          <div className="relative bg-white rounded-2xl p-3 flex items-center gap-3 border-[2.5px] border-black">
                            <div className="w-10 h-10 rounded-full border-2 border-black bg-[#2563FF] flex items-center justify-center text-white font-black text-sm shrink-0">
                              {p.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate">{p.email}</p>
                              <p className="text-[9px] text-muted-foreground uppercase">{p.role} · {p.country || "—"}</p>
                            </div>
                            {p.id !== user?.id && <DeleteBtn onClick={() => deleteUser(p.id)} />}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TABS USUARIO — importados + mis votos */}
          <div>
            {/* Tabs */}
            <div className="flex border-[2.5px] border-black rounded-2xl overflow-hidden mb-3">
              {([
                { id: "importados", label: `Importados (${products.length})`, icon: <CheckCircle2 size={11} /> },
                ...(user ? [{ id: "mis-votos", label: `Ayudé (${importedIVotedFor.length})`, icon: <Star size={11} /> }] : []),
              ] as { id: UserTab; label: string; icon: React.ReactNode }[]).map((t, i) => (
                <button key={t.id} onClick={() => setUserTab(t.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[8px] font-black uppercase tracking-wider transition-all"
                  style={{ backgroundColor: userTab === t.id ? "#1a1a1a" : "white", color: userTab === t.id ? "white" : "#1a1a1a", borderRight: i === 0 ? "2.5px solid black" : "none" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tab importados */}
            {userTab === "importados" && (
              products.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <CheckCircle2 size={32} className="text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">Todavía no hay productos importados.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {products.map(p => (
                    <ProductRow key={p.id} p={p} badge={user && myVotes[p.id] ? voteBadge(myVotes[p.id]) ?? undefined : undefined} />
                  ))}
                </div>
              )
            )}

            {/* Tab mis votos en importados */}
            {userTab === "mis-votos" && (
              !user ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Star size={28} className="text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">Iniciá sesión para ver tu contribución.</p>
                </div>
              ) : importedIVotedFor.length === 0 && importedIVotedAgainst.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Star size={28} className="text-muted-foreground opacity-30" />
                  <p className="text-sm text-muted-foreground">No votaste ningún producto importado.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {importedIVotedFor.length > 0 && (
                    <div>
                      <div className="relative mb-2">
                        <div className="absolute inset-0 rounded-xl bg-black" style={{ translate: "3px 3px" }} />
                        <div className="relative bg-[#C8F000] border-[2px] border-black rounded-xl px-3 py-2 flex items-center gap-2">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          <p className="text-[9px] font-black uppercase tracking-widest">Ayudaste a traer ({importedIVotedFor.length})</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {importedIVotedFor.map(p => (
                          <ProductRow key={p.id} p={p} badge={voteBadge(myVotes[p.id]) ?? undefined} />
                        ))}
                      </div>
                    </div>
                  )}
                  {importedIVotedAgainst.length > 0 && (
                    <div>
                      <div className="relative mb-2">
                        <div className="absolute inset-0 rounded-xl bg-black" style={{ translate: "3px 3px" }} />
                        <div className="relative bg-[#FF3CAC] border-[2px] border-black rounded-xl px-3 py-2 flex items-center gap-2 text-white">
                          <ThumbsDown size={12} strokeWidth={3} />
                          <p className="text-[9px] font-black uppercase tracking-widest">Votaste en contra ({importedIVotedAgainst.length})</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {importedIVotedAgainst.map(p => (
                          <ProductRow key={p.id} p={p} badge={voteBadge(myVotes[p.id]) ?? undefined} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}