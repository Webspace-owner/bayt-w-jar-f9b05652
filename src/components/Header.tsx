import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, User as UserIcon, MessageSquare, Shield } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-black text-xl shadow-md">
            د
          </div>
          <span className="text-2xl font-black tracking-tight text-primary">دار</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/new-listing">
            <Button size="sm" className="gap-1 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>أضف إعلان</span>
            </Button>
          </Link>
          {user ? (
            <>
              <Link to="/messages">
                <Button variant="ghost" size="sm" className="gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">الرسائل</span>
                </Button>
              </Link>
              <Link to="/my-listings" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="gap-1">
                  <UserIcon className="h-4 w-4" />
                  إعلاناتي
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">المسؤول</span>
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                تسجيل
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
