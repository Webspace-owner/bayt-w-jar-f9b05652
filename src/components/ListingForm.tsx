import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_TYPES } from "@/lib/constants";
import { ImageUploader } from "@/components/ImageUploader";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(5, "العنوان قصير").max(150),
  description: z.string().trim().max(2000).optional(),
  price: z.number().min(1, "أدخل السعر"),
  property_type: z.enum(["apartment", "villa", "land", "shop", "office", "building"]),
  purpose: z.enum(["sale", "rent"]),
  city: z.string().trim().min(2, "أدخل المدينة").max(80),
  district: z.string().trim().max(80).optional(),
  area: z.number().optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  contact_phone: z.string().trim().max(30).optional(),
  contact_whatsapp: z.string().trim().max(30).optional(),
});

export interface ListingFormValues {
  title: string;
  description: string;
  price: string;
  property_type: string;
  purpose: string;
  city: string;
  district: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  contact_phone: string;
  contact_whatsapp: string;
  images: string[];
}

export const emptyListingForm: ListingFormValues = {
  title: "", description: "", price: "", property_type: "",
  purpose: "", city: "", district: "", area: "", bedrooms: "",
  bathrooms: "", contact_phone: "", contact_whatsapp: "", images: [],
};

interface Props {
  userId: string;
  initial?: ListingFormValues;
  submitLabel: string;
  onSubmit: (data: {
    title: string; description: string | null; price: number;
    property_type: any; purpose: any; city: string; district: string | null;
    area: number | null; bedrooms: number | null; bathrooms: number | null;
    contact_phone: string | null; contact_whatsapp: string | null; images: string[];
  }) => Promise<void>;
}

const ROOMS_HIDDEN = new Set(["land"]);

export function ListingForm({ userId, initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<ListingFormValues>(initial ?? emptyListingForm);
  const [busy, setBusy] = useState(false);
  const upd = (k: keyof ListingFormValues, v: any) => setForm(f => ({ ...f, [k]: v }));
  const hideRooms = ROOMS_HIDDEN.has(form.property_type);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (!form.property_type) throw new Error("اختر نوع العقار");
      if (!form.purpose) throw new Error("اختر نوع العملية");
      const data = schema.parse({
        title: form.title,
        description: form.description || undefined,
        price: Number(form.price),
        property_type: form.property_type as any,
        purpose: form.purpose as any,
        city: form.city,
        district: form.district || undefined,
        area: form.area ? Number(form.area) : undefined,
        bedrooms: !hideRooms && form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: !hideRooms && form.bathrooms ? Number(form.bathrooms) : undefined,
        contact_phone: form.contact_phone || undefined,
        contact_whatsapp: form.contact_whatsapp || undefined,
      });
      await onSubmit({
        title: data.title,
        description: data.description ?? null,
        price: data.price,
        property_type: data.property_type,
        purpose: data.purpose,
        city: data.city,
        district: data.district ?? null,
        area: data.area ?? null,
        bedrooms: hideRooms ? null : (data.bedrooms ?? null),
        bathrooms: hideRooms ? null : (data.bathrooms ?? null),
        contact_phone: data.contact_phone ?? null,
        contact_whatsapp: data.contact_whatsapp ?? null,
        images: form.images,
      });
    } catch (err: any) {
      if (err?.issues) toast.error(err.issues[0].message);
      else toast.error(err?.message || "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>صور الإعلان</Label>
        <ImageUploader userId={userId} images={form.images} onChange={imgs => upd("images", imgs)} />
      </div>

      <div className="space-y-2">
        <Label>عنوان الإعلان *</Label>
        <Input value={form.title} onChange={e => upd("title", e.target.value)} placeholder="مثال: شقة فاخرة في حي الياسمين" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نوع العقار *</Label>
          <Select value={form.property_type} onValueChange={v => upd("property_type", v)}>
            <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>نوع العملية *</Label>
          <Select value={form.purpose} onValueChange={v => upd("purpose", v)}>
            <SelectTrigger><SelectValue placeholder="بيع أم إيجار" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">للبيع</SelectItem>
              <SelectItem value="rent">للإيجار</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>السعر (جنيه مصري) *</Label>
        <Input type="number" value={form.price} onChange={e => upd("price", e.target.value)} placeholder="مثال: 500000" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>المدينة *</Label>
          <Input value={form.city} onChange={e => upd("city", e.target.value)} placeholder="مثال: القاهرة" required />
        </div>
        <div className="space-y-2">
          <Label>الحي</Label>
          <Input value={form.district} onChange={e => upd("district", e.target.value)} placeholder="مثال: المعادي" />
        </div>
      </div>

      <div className={`grid gap-4 ${hideRooms ? "grid-cols-1" : "grid-cols-3"}`}>
        <div className="space-y-2">
          <Label>المساحة (م²)</Label>
          <Input type="number" value={form.area} onChange={e => upd("area", e.target.value)} placeholder="مثال: 200" />
        </div>
        {!hideRooms && (
          <>
            <div className="space-y-2">
              <Label>غرف النوم</Label>
              <Input type="number" value={form.bedrooms} onChange={e => upd("bedrooms", e.target.value)} placeholder="مثال: 3" />
            </div>
            <div className="space-y-2">
              <Label>الحمامات</Label>
              <Input type="number" value={form.bathrooms} onChange={e => upd("bathrooms", e.target.value)} placeholder="مثال: 2" />
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label>رقم التواصل</Label>
        <Input dir="ltr" value={form.contact_phone} onChange={e => upd("contact_phone", e.target.value)} placeholder="+20 1xxxxxxxxx" />
      </div>

      <div className="space-y-2">
        <Label>الوصف</Label>
        <Textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={4} placeholder="تفاصيل إضافية عن العقار..." />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "..." : submitLabel}
      </Button>
    </form>
  );
}
