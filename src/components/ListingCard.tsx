import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { PROPERTY_TYPE_LABELS, PURPOSE_LABELS } from "@/lib/constants";

export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  property_type: string;
  purpose: string;
  city: string;
  district: string | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  images: string[];
  created_at: string;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800";
  return (
    <Link to="/listing/$id" params={{ id: listing.id }}>
      <Card className="group overflow-hidden border-border/60 transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 py-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-md">
            {PURPOSE_LABELS[listing.purpose]}
          </Badge>
          <Badge variant="secondary" className="absolute top-3 left-3 bg-background/90">
            {PROPERTY_TYPE_LABELS[listing.property_type]}
          </Badge>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="text-2xl font-black text-primary">
            {listing.price.toLocaleString("ar-EG")}{" "}
            <span className="text-sm font-medium text-muted-foreground">جنيه مصري</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">
              {listing.city}{listing.district ? ` - ${listing.district}` : ""}
            </span>
          </div>
          {(listing.bedrooms || listing.bathrooms || listing.area) && (
            <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground border-t">
              {listing.bedrooms != null && (
                <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {listing.bedrooms}</span>
              )}
              {listing.bathrooms != null && (
                <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {listing.bathrooms}</span>
              )}
              {listing.area != null && (
                <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {listing.area} م²</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
