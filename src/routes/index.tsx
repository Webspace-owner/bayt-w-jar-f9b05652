import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ListingCard, type Listing } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROPERTY_TYPES } from "@/lib/constants";
import {
  Search,
  Plus,
  ShieldCheck,
  Zap,
  Users,
  BadgeCheck,
  Phone,
  Heart,
  TrendingUp,
  MapPinned,
} from "lucide-react";
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
          <div className="inline-flex items-center gap-2 bg-background/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-background/20">
            <BadgeCheck className="h-4 w-4" />
            مو موثوقة لآلاف العملاء في مصر
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight drop-shadow-lg">دار</h1>
          <p className="text-xl md:text-2xl font-medium mb-2 opacity-95">سوق العقارات الأول في مصر</p>
          <p className="text-base md:text-lg mb-8 opacity-85 max-w-xl mx-auto">
            اعثر على بيت أحلامك، أو أعلن عن عقارك مجاناً ووصّلك آلاف المشترين الجادين
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto mt-10">
            {[
              { n: "+10K", l: "عميل سعيد" },
              { n: "+5K", l: "عقار متاح" },
              { n: "100%", l: "مجاناً" },
            ].map(s => (
              <div key={s.l} className="bg-background/10 backdrop-blur rounded-xl p-3 border border-background/20">
                <div className="text-2xl md:text-3xl font-black">{s.n}</div>
                <div className="text-xs md:text-sm opacity-90">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-3">لماذا تختار دار؟</h2>
          <p className="text-muted-foreground">كل ما تحتاجه للوصول لعقارك المثالي في مكان واحد</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { icon: ShieldCheck, t: "إعلانات موثوقة", d: "نتحقق من الإعلانات لضمان الجدية والمصداقية" },
            { icon: Zap, t: "نشر فوري", d: "أضف إعلانك في أقل من دقيقة وابدأ تستقبل المهتمين" },
            { icon: Users, t: "تواصل مباشر", d: "تواصل مباشرة مع المالك بدون وسطاء أو عمولات" },
            { icon: TrendingUp, t: "أحدث العروض", d: "اكتشف أحدث العقارات المضافة يومياً" },
            { icon: MapPinned, t: "كل المدن", d: "عقارات في جميع محافظات ومدن مصر" },
            { icon: Heart, t: "مجاناً تماماً", d: "بدون رسوم خفية، أعلِن وتصفّح بدون أي تكاليف" },
          ].map(f => (
            <div
              key={f.t}
              className="group p-6 rounded-2xl border-2 border-border/60 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all bg-card"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10 border-t">
        <h2 className="text-2xl md:text-3xl font-black mb-2">تصفح حسب النوع</h2>
        <p className="text-muted-foreground mb-6">اختر نوع العقار اللي بتدور عليه</p>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
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
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-black mb-6">أحدث الإعلانات</h2>
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

      {/* How it works */}
      <section className="bg-muted/40 border-y py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">كيف تنشر إعلانك؟</h2>
            <p className="text-muted-foreground">٣ خطوات بسيطة وإعلانك أونلاين</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { n: "١", t: "سجّل حسابك", d: "أنشئ حسابك مجاناً في ثوانٍ" },
              { n: "٢", t: "أضف بيانات العقار", d: "ارفع الصور واكتب وصفاً مفصلاً" },
              { n: "٣", t: "استقبل العملاء", d: "تواصل مباشرة مع المهتمين بعقارك" },
            ].map(s => (
              <div key={s.n} className="relative bg-card rounded-2xl p-6 pt-10 border-2 border-border/60 text-center">
                <div className="absolute -top-6 right-1/2 translate-x-1/2 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black shadow-lg">
                  {s.n}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div
          className="rounded-3xl p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden"
          style={{ background: "var(--gradient-hero)" }}
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">عندك عقار؟ أعلِن عنه دلوقتي</h2>
          <p className="text-lg opacity-95 mb-8 max-w-xl mx-auto">
            انشر إعلانك مجاناً ووصّلك آلاف المشترين الجادين خلال أيام
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/new-listing">
              <Button size="lg" variant="secondary" className="gap-2 h-12 px-6">
                <Plus className="h-5 w-5" /> أضف إعلانك مجاناً
              </Button>
            </Link>
            <Link to="/my-listings">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 h-12 px-6 bg-transparent border-background/40 text-primary-foreground hover:bg-background/15 hover:text-primary-foreground"
              >
                <Phone className="h-5 w-5" /> إعلاناتي
              </Button>
            </Link>
          </div>
        </div>
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
