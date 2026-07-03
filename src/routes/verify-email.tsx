import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("بنأكد بريدك الإلكتروني...");
  const [failed, setFailed] = useState(false);
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const finish = async () => {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const next = getSafeNext(params.get("next") || hash.get("next"));

      const code = params.get("code");
      const tokenHash = params.get("token_hash") || params.get("token");
      const type = (params.get("type") || "signup") as any;
      const errorDesc = params.get("error_description") || hash.get("error_description");

      try {
        if (errorDesc) throw new Error(errorDesc);

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          const { error } = await supabase.auth.setSession({
            access_token: hash.get("access_token")!,
            refresh_token: hash.get("refresh_token")!,
          });
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) throw new Error("مافيش كود تأكيد في الرابط");
        }

        if (!active) return;
        setStatus("تم تأكيد البريد بنجاح.");
        window.setTimeout(() => window.location.replace(next), 900);
      } catch (e: any) {
        if (!active) return;
        setFailed(true);
        setStatus("رابط التأكيد غير صالح أو انتهت صلاحيته. جرّب تبعت إيميل تأكيد جديد.");
        setDetails(e?.message || null);
      }
    };

    finish();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center shadow-[var(--shadow-elegant)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-2xl font-black">
          د
        </div>
        <h1 className="text-2xl font-black mb-3">تأكيد الحساب</h1>
        <p className="text-muted-foreground leading-7 mb-4">{status}</p>
        {details && <p className="text-xs text-muted-foreground/70 mb-4 break-all">{details}</p>}
        {failed && (
          <Button onClick={() => navigate({ to: "/auth" })} className="w-full">
            ارجع لتسجيل الدخول
          </Button>
        )}
      </Card>
    </div>
  );
}
