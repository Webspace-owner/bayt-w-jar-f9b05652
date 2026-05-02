import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, BedDouble, Bath, Maximize, Phone, ArrowRight } from "lucide-react";
import { PROPERTY_TYPE_LABELS, PURPOSE_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/listing/$id")({
  component: ListingDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">الإعلان غير موجود</h1>
        <Link to="/" className="text-primary">العودة للرئيسية</Link>
      </div>
    </div>
  ),
});

interface FullListing {
  id: string; title: string; description: string | null; price: number; currency: string;
  property_type: string; purpose: string; city: string; district: string | null;
  area: number | null; bedrooms: number | null; bathrooms: number | null;
  contact_phone: string | null; images: string[]; created_at: string;
}

function ListingDetail() {
  const { id } = Route.useParams();
  const [listing, setListing] = useState<FullListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("listings").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setListing(data as FullListing | null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!listing) throw notFound();

  const cover = listing.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowRight className="h-4 w-4 rotate-180" /> العودة
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-muted shadow-[var(--shadow-card)]">
              <img src={cover} alt={listing.title} className="h-full w-full object-cover" />
            </div>

            <Card className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">{PURPOSE_LABELS[listing.purpose]}</Badge>
                <Badge variant="secondary">{PROPERTY_TYPE_LABELS[listing.property_type]}</Badge>
              </div>
              <h1 className="text-3xl font-black">{listing.title}</h1>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{listing.city}{listing.district ? ` - ${listing.district}` : ""}</span>
              </div>
              {listing.description && (
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line border-t pt-4">
                  {listing.description}
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6 space-y-4 sticky top-20">
              <div>
                <p className="text-sm text-muted-foreground mb-1">السعر</p>
                <p className="text-4xl font-black text-primary">
                  {listing.price.toLocaleString("ar-EG")}
                  <span className="text-lg font-medium text-muted-foreground"> جنيه مصري</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-y py-4">
                {listing.bedrooms != null && (
                  <div className="text-center">
                    <BedDouble className="h-5 w-5 mx-auto text-primary mb-1" />
                    <div className="font-bold">{listing.bedrooms}</div>
                    <div className="text-xs text-muted-foreground">غرف</div>
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="text-center">
                    <Bath className="h-5 w-5 mx-auto text-primary mb-1" />
                    <div className="font-bold">{listing.bathrooms}</div>
                    <div className="text-xs text-muted-foreground">حمامات</div>
                  </div>
                )}
                {listing.area != null && (
                  <div className="text-center">
                    <Maximize className="h-5 w-5 mx-auto text-primary mb-1" />
                    <div className="font-bold">{listing.area}</div>
                    <div className="text-xs text-muted-foreground">م²</div>
                  </div>
                )}
              </div>

              {listing.contact_phone && (
                <a href={`tel:${listing.contact_phone}`}>
                  <Button size="lg" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{listing.contact_phone}</span>
                  </Button>
                </a>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
