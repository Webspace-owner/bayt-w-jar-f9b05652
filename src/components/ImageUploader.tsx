import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export function ImageUploader({ userId, images, onChange, max = 8 }: Props) {
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > max) {
      toast.error(`الحد الأقصى ${max} صور`);
      return;
    }
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: الصورة أكبر من 5 ميجا`);
          continue;
        }
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("listing-images").upload(path, file);
        if (error) {
          toast.error(error.message);
          continue;
        }
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length) {
        onChange([...images, ...uploaded]);
        toast.success(`تم رفع ${uploaded.length} صورة`);
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (url: string) => {
    const idx = url.indexOf("/listing-images/");
    if (idx !== -1) {
      const path = url.substring(idx + "/listing-images/".length);
      await supabase.storage.from("listing-images").remove([path]);
    }
    onChange(images.filter(i => i !== url));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map(url => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition">
            <Upload className="h-5 w-5" />
            <span className="text-xs">{busy ? "..." : "إضافة صورة"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={busy}
              onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">حد أقصى {max} صور، حجم كل صورة أقل من 5 ميجا</p>
    </div>
  );
}
