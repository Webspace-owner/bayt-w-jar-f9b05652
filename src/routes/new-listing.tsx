import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { ListingForm } from "@/components/ListingForm";
import { toast } from "sonner";

export const Route = createFileRoute("/new-listing")({
  component: NewListing,
});

function NewListing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← العودة للرئيسية
        </Link>
        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">إضافة إعلان جديد</h1>
          <ListingForm
            userId={user.id}
            submitLabel="نشر الإعلان"
            onSubmit={async (data) => {
              const { error } = await supabase.from("listings").insert({
                user_id: user.id,
                ...data,
              });
              if (error) throw error;
              toast.success("تم نشر الإعلان بنجاح!");
              navigate({ to: "/my-listings" });
            }}
          />
        </Card>
      </div>
    </div>
  );
}
