import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

interface Conv {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  updated_at: string;
  listings: { title: string; images: string[] } | null;
}

function MessagesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("conversations")
      .select("id, listing_id, buyer_id, seller_id, updated_at, listings(title, images)")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setConvs((data as any) ?? []);
        setBusy(false);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> الرسائل
        </h1>
        {busy ? (
          <p className="text-muted-foreground text-center py-10">جاري التحميل...</p>
        ) : convs.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">لا توجد محادثات بعد</Card>
        ) : (
          <div className="space-y-3">
            {convs.map(c => {
              const isSeller = c.seller_id === user.id;
              return (
                <Link key={c.id} to="/conversation/$id" params={{ id: c.id }}>
                  <Card className="p-4 flex items-center gap-3 hover:shadow-md transition">
                    <img
                      src={c.listings?.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200"}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold line-clamp-1">{c.listings?.title || "إعلان"}</p>
                      <p className="text-xs text-muted-foreground">
                        {isSeller ? "محادثة مع مشترٍ مهتم" : "محادثة مع المعلن"}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
