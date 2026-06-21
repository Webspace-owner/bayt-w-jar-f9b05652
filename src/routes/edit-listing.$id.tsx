import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { ListingForm, type ListingFormValues } from "@/components/ListingForm";
import { toast } from "sonner";

export const Route = createFileRoute("/edit-listing/$id")({
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<ListingFormValues | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("listings").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); return; }
      if (data.user_id !== user.id) { toast.error("غير مصرح"); navigate({ to: "/my-listings" }); return; }
      setInitial({
        title: data.title ?? "",
        description: data.description ?? "",
        price: String(data.price ?? ""),
        property_type: data.property_type ?? "apartment",
        purpose: data.purpose ?? "sale",
        city: data.city ?? "",
        district: data.district ?? "",
        area: data.area != null ? String(data.area) : "",
        bedrooms: data.bedrooms != null ? String(data.bedrooms) : "",
        bathrooms: data.bathrooms != null ? String(data.bathrooms) : "",
        contact_phone: data.contact_phone ?? "",
        contact_whatsapp: (data as any).contact_whatsapp ?? "",
        images: data.images ?? [],
      });
    });
  }, [user, id, navigate]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">الإعلان غير موجود</p>
          <Link to="/my-listings" className="text-primary hover:underline mt-2 inline-block">العودة لإعلاناتي</Link>
        </div>
      </div>
    );
  }

  if (!user || !initial) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/my-listings" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← العودة لإعلاناتي
        </Link>
        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">تعديل الإعلان</h1>
          <ListingForm
            userId={user.id}
            initial={initial}
            submitLabel="حفظ التعديلات"
            onSubmit={async (data) => {
              const { error } = await supabase.from("listings").update(data).eq("id", id);
              if (error) throw error;
              toast.success("تم حفظ التعديلات");
              navigate({ to: "/my-listings" });
            }}
          />
        </Card>
      </div>
    </div>
  );
}
