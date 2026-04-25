import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/new-listing")({
  component: NewListing,
});

const schema = z.object({
  title: z.string().trim().min(5, "العنوان قصير").max(150),
  description: z.string().trim().max(2000).optional(),
  price: z.number().min(1, "أدخل السعر"),
  property_type: z.enum(["apartment", "villa", "land", "shop", "office"]),
  purpose: z.enum(["sale", "rent"]),
  city: z.string().trim().min(2, "أدخل المدينة").max(80),
  district: z.string().trim().max(80).optional(),
  area: z.number().optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  contact_phone: z.string().trim().max(30).optional(),
  image_url: z.string().trim().url().optional().or(z.literal("")),
});

function NewListing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", price: "", property_type: "apartment",
    purpose: "sale", city: "", district: "", area: "", bedrooms: "",
    bathrooms: "", contact_phone: "", image_url: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const data = schema.parse({
        title: form.title,
        description: form.description || undefined,
        price: Number(form.price),
        property_type: form.property_type as any,
        purpose: form.purpose as any,
        city: form.city,
        district: form.district || undefined,
        area: form.area ? Number(form.area) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        contact_phone: form.contact_phone || undefined,
        image_url: form.image_url || undefined,
      });

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: data.title,
        description: data.description ?? null,
        price: data.price,
        property_type: data.property_type,
        purpose: data.purpose,
        city: data.city,
        district: data.district ?? null,
        area: data.area ?? null,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        contact_phone: data.contact_phone ?? null,
        images: data.image_url ? [data.image_url] : [],
      });
      if (error) throw error;
      toast.success("تم نشر الإعلان بنجاح!");
      navigate({ to: "/my-listings" });
    } catch (err: any) {
      if (err?.issues) toast.error(err.issues[0].message);
      else toast.error(err?.message || "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          ← العودة للرئيسية
        </Link>
        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">إضافة إعلان جديد</h1>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الإعلان *</Label>
              <Input value={form.title} onChange={e => upd("title", e.target.value)} placeholder="شقة فاخرة في حي الياسمين" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع العقار *</Label>
                <Select value={form.property_type} onValueChange={v => upd("property_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">للبيع</SelectItem>
                    <SelectItem value="rent">للإيجار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>السعر *</Label>
              <Input type="number" value={form.price} onChange={e => upd("price", e.target.value)} placeholder="500000" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المدينة *</Label>
                <Input value={form.city} onChange={e => upd("city", e.target.value)} placeholder="الرياض" required />
              </div>
              <div className="space-y-2">
                <Label>الحي</Label>
                <Input value={form.district} onChange={e => upd("district", e.target.value)} placeholder="الياسمين" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>المساحة (م²)</Label>
                <Input type="number" value={form.area} onChange={e => upd("area", e.target.value)} placeholder="200" />
              </div>
              <div className="space-y-2">
                <Label>غرف النوم</Label>
                <Input type="number" value={form.bedrooms} onChange={e => upd("bedrooms", e.target.value)} placeholder="3" />
              </div>
              <div className="space-y-2">
                <Label>الحمامات</Label>
                <Input type="number" value={form.bathrooms} onChange={e => upd("bathrooms", e.target.value)} placeholder="2" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>رقم التواصل</Label>
              <Input dir="ltr" value={form.contact_phone} onChange={e => upd("contact_phone", e.target.value)} placeholder="+966 5xxxxxxxx" />
            </div>

            <div className="space-y-2">
              <Label>رابط صورة (اختياري)</Label>
              <Input dir="ltr" value={form.image_url} onChange={e => upd("image_url", e.target.value)} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={4} placeholder="تفاصيل إضافية عن العقار..." />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "جاري النشر..." : "نشر الإعلان"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
