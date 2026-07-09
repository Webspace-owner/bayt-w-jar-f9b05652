import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, Home, MessageSquare, Users, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type ListingRow = {
  id: string; title: string; city: string; price: number;
  created_at: string; user_id: string; status: string;
};
type ConvRow = { id: string; listing_id: string; buyer_id: string; seller_id: string; listings: { title: string } | null };
type MsgRow = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };
type ProfileRow = { id: string; full_name: string | null; phone: string | null; is_suspended: boolean; created_at: string };

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [convs, setConvs] = useState<ConvRow[]>([]);
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const loadAll = useCallback(async () => {
    const [l, c, m, p] = await Promise.all([
      supabase.from("listings").select("id, title, city, price, created_at, user_id, status").order("created_at", { ascending: false }).limit(200),
      supabase.from("conversations").select("id, listing_id, buyer_id, seller_id, listings(title)").order("updated_at", { ascending: false }).limit(100),
      supabase.from("messages").select("id, conversation_id, sender_id, body, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("id, full_name, phone, is_suspended, created_at").order("created_at", { ascending: false }).limit(200),
    ]);
    setListings((l.data ?? []) as ListingRow[]);
    setConvs((c.data ?? []) as unknown as ConvRow[]);
    setMessages((m.data ?? []) as MsgRow[]);
    setProfiles((p.data ?? []) as ProfileRow[]);
  }, []);

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin, loadAll]);

  const toggleListingStatus = async (id: string, current: string) => {
    const next = current === "suspended" ? "active" : "suspended";
    const { error } = await supabase.from("listings").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next === "suspended" ? "تم إيقاف الإعلان" : "تم تفعيل الإعلان");
    setListings(ls => ls.map(l => l.id === id ? { ...l, status: next } : l));
  };

  const deleteListing = async (id: string) => {
    if (!confirm("متأكد من حذف الإعلان نهائياً؟")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    setListings(ls => ls.filter(l => l.id !== id));
  };

  const toggleUserSuspend = async (id: string, current: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_suspended: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(!current ? "تم إيقاف العضو" : "تم تفعيل العضو");
    setProfiles(ps => ps.map(p => p.id === id ? { ...p, is_suspended: !current } : p));
  };

  if (!user) return null;

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h1 className="text-xl font-bold mb-2">غير مصرح</h1>
          <p className="text-muted-foreground">الصفحة دي للمسؤولين بس</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> لوحة المسؤول
        </h1>
        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings"><Home className="h-4 w-4 ml-1" /> الإعلانات ({listings.length})</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 ml-1" /> الأعضاء ({profiles.length})</TabsTrigger>
            <TabsTrigger value="convs"><MessageSquare className="h-4 w-4 ml-1" /> المحادثات ({convs.length})</TabsTrigger>
            <TabsTrigger value="msgs">آخر الرسائل ({messages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-2 mt-4">
            {listings.map(l => (
              <Card key={l.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <Link to="/listing/$id" params={{ id: l.id }} className="flex-1 min-w-0">
                  <p className="font-semibold flex items-center gap-2">
                    {l.title}
                    {l.status === "suspended" && <Badge variant="destructive">موقوف</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{l.city} · {Number(l.price).toLocaleString("ar-EG")} ج.م · {new Date(l.created_at).toLocaleString("ar-EG")}</p>
                </Link>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant={l.status === "suspended" ? "default" : "secondary"} onClick={() => toggleListingStatus(l.id, l.status)} className="gap-1">
                    {l.status === "suspended" ? <><CheckCircle2 className="h-3.5 w-3.5" /> تفعيل</> : <><Ban className="h-3.5 w-3.5" /> إيقاف</>}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteListing(l.id)} className="gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> حذف
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-2 mt-4">
            {profiles.map(p => (
              <Card key={p.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold flex items-center gap-2">
                    {p.full_name || "بدون اسم"}
                    {p.is_suspended && <Badge variant="destructive">موقوف</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{p.phone || "—"} · {p.id.slice(0,8)}</p>
                </div>
                <Button size="sm" variant={p.is_suspended ? "default" : "secondary"} onClick={() => toggleUserSuspend(p.id, p.is_suspended)} className="gap-1">
                  {p.is_suspended ? <><CheckCircle2 className="h-3.5 w-3.5" /> تفعيل</> : <><Ban className="h-3.5 w-3.5" /> إيقاف العضوية</>}
                </Button>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="convs" className="space-y-2 mt-4">
            {convs.map(c => (
              <Link key={c.id} to="/conversation/$id" params={{ id: c.id }}>
                <Card className="p-3 hover:bg-accent transition">
                  <p className="font-semibold">{c.listings?.title || "إعلان"}</p>
                  <p className="text-xs text-muted-foreground font-mono">مشترٍ: {c.buyer_id.slice(0,8)} · معلن: {c.seller_id.slice(0,8)}</p>
                </Card>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="msgs" className="space-y-2 mt-4">
            {messages.map(m => (
              <Card key={m.id} className="p-3">
                <p className="text-sm">{m.body}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">من: {m.sender_id.slice(0,8)} · {new Date(m.created_at).toLocaleString("ar-EG")}</p>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
