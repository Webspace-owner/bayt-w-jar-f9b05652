import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ListingCard, type Listing } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROPERTY_TYPES } from "@/lib/constants";
import { Search, Plus, ShieldCheck, Zap, Users, BadgeCheck, Phone, Heart, TrendingUp, MapPinned } from "lucide-react";
import heroImage from "@/assets/hero-villa.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let q = supabase.from("listings").select("*").order("created_at", { ascending: false }).limit(24);
    if (filter) q = q.eq("property_type", filter as any);
    q.then(({ data }) => {
      setListings((data ?? []) as Listing[]);
      setLoading(false);
    });
  }, [filter]);

  const filtered = search
    ? listings.filter(l =>
        l.title.includes(search) || l.city.includes(search) || (l.district ?? "").includes(search)
      )
    : listings;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="عقارات فاخرة" className="h-full w-full object-cover" width={1600} height={900} />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32 text-center text-primary-foreground">
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight drop-shadow-lg">
            دار
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 opacity-95">
            سوق العقارات الأول — اعثر على بيتك أو أعلن عن عقارك
          </p>
          <div className="max-w-2xl mx-auto bg-background/95 rounded-2xl p-2 flex gap-2 shadow-2xl backdrop-blur">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن مدينة، حي، أو وصف..."
                className="pr-10 h-12 border-0 bg-transparent focus-visible:ring-0 text-foreground"
              />
            </div>
            <Link to="/new-listing">
              <Button size="lg" className="h-12 gap-1 shadow-md">
                <Plus className="h-5 w-5" />
                أضف إعلان
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">تصفح حسب النوع</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          <button
            onClick={() => setFilter(null)}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              filter === null
                ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="text-3xl mb-2">🏠</div>
            <div className="font-semibold text-sm">الكل</div>
          </button>
          {PROPERTY_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                filter === t.value
                  ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-semibold text-sm">{t.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6">أحدث الإعلانات</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏘️</div>
            <p className="text-lg text-muted-foreground mb-6">لا توجد إعلانات بعد. كن أول من يضيف!</p>
            <Link to="/new-listing">
              <Button size="lg" className="gap-1">
                <Plus className="h-5 w-5" /> أضف أول إعلان
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

      <footer className="border-t bg-muted/30 py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p className="font-bold text-primary text-lg mb-2">دار</p>
          <p>© 2026 دار - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
