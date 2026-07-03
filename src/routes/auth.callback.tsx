import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("بنأكد بريدك الإلكتروني...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const finishAuth = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const type = url.searchParams.get("type");
      const next = getSafeNext(url.searchParams.get("next"));

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
        }

        if (!active) return;
        setStatus(type === "recovery" ? "تم التأكيد، هتقدر تغيّر كلمة المرور دلوقتي." : "تم تأكيد البريد بنجاح.");

        window.setTimeout(() => {
          if (type === "recovery") navigate({ to: "/reset-password", replace: true });
          else navigate({ to: next, replace: true });
        }, 900);
      } catch {
        if (!active) return;
        setFailed(true);
        setStatus("رابط التأكيد غير صالح أو انتهت صلاحيته. جرّب تبعت إيميل تأكيد جديد.");
      }
    };

    finishAuth();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center shadow-[var(--shadow-elegant)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-black">
          د
        </div>
        <h1 className="text-2xl font-black mb-3">تأكيد الحساب</h1>
        <p className="text-muted-foreground leading-7 mb-6">{status}</p>
        {failed && (
          <Button onClick={() => navigate({ to: "/auth" })} className="w-full">
            ارجع لتسجيل الدخول
          </Button>
        )}
      </Card>
    </div>
  );
}