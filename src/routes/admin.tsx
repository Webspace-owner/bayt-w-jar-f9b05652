import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, Home, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [convs, setConvs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("listings").select("id, title, city, price, created_at, user_id").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setListings(data ?? []));
    supabase.from("conversations").select("id, listing_id, buyer_id, seller_id, updated_at, listings(title)").order("updated_at", { ascending: false }).limit(100)
      .then(({ data }) => setConvs(data ?? []));
    supabase.from("messages").select("id, conversation_id, sender_id, body, created_at").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setMessages(data ?? []));
  }, [isAdmin]);

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
          <p className="text-muted-foreground">هذه الصفحة للمسؤولين فقط</p>
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
            <TabsTrigger value="convs"><MessageSquare className="h-4 w-4 ml-1" /> المحادثات ({convs.length})</TabsTrigger>
            <TabsTrigger value="msgs">آخر الرسائل ({messages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-2 mt-4">
            {listings.map(l => (
              <Link key={l.id} to="/listing/$id" params={{ id: l.id }}>
                <Card className="p-3 hover:bg-accent transition">
                  <p className="font-semibold">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.city} · {Number(l.price).toLocaleString("ar-EG")} ج.م · {new Date(l.created_at).toLocaleString("ar-EG")}</p>
                </Card>
              </Link>
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
