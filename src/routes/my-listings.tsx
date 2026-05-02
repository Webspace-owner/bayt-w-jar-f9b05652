import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { ListingCard, type Listing } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/my-listings")({
  component: MyListings,
});

function MyListings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setListings((data ?? []) as Listing[]));
  }, [user]);

  const del = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف الإعلان؟")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setListings(ls => ls.filter(l => l.id !== id));
    toast.success("تم الحذف");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">إعلاناتي</h1>
          <Link to="/new-listing"><Button className="gap-1"><Plus className="h-4 w-4" /> أضف إعلان</Button></Link>
        </div>
        {listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">لم تضف أي إعلانات بعد</p>
            <Link to="/new-listing"><Button size="lg">ابدأ بإضافة إعلانك الأول</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listings.map(l => (
              <div key={l.id} className="relative">
                <ListingCard listing={l} />
                <div className="absolute bottom-3 left-3 z-10 flex gap-2">
                  <Link to="/edit-listing/$id" params={{ id: l.id }}>
                    <Button size="sm" className="h-8 gap-1">
                      <Pencil className="h-3.5 w-3.5" /> تعديل
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => del(l.id)}
                    className="h-8 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
