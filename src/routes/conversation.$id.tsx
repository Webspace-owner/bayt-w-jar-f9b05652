import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/conversation/$id")({
  component: ConversationPage,
});

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface Conv {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listings: { title: string } | null;
}

function ConversationPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [conv, setConv] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("conversations").select("id, listing_id, buyer_id, seller_id, listings(title)").eq("id", id).maybeSingle()
      .then(({ data }) => setConv(data as any));
    supabase.from("messages").select("*").eq("conversation_id", id).order("created_at")
      .then(({ data }) => setMessages((data as any) ?? []));

    const channel = supabase
      .channel(`conv:${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => setMessages(m => [...m, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!user || !conv) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: id, sender_id: user.id, body,
    });
    if (error) toast.error(error.message);
    else setText("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-6 flex-1 flex flex-col">
        <Link to="/messages" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-3">
          <ArrowRight className="h-4 w-4 rotate-180" /> الرسائل
        </Link>
        <Link to="/listing/$id" params={{ id: conv.listing_id }}>
          <Card className="p-3 mb-3 hover:bg-accent transition">
            <p className="text-xs text-muted-foreground">بخصوص الإعلان</p>
            <p className="font-semibold line-clamp-1">{conv.listings?.title}</p>
          </Card>
        </Link>

        <Card className="flex-1 flex flex-col p-4 min-h-[400px]">
          <div className="flex-1 space-y-2 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">ابدأ المحادثة بكتابة رسالة</p>
            )}
            {messages.map(m => {
              const mine = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.body}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 pt-3 border-t mt-3">
            <Input value={text} onChange={e => setText(e.target.value)} placeholder="اكتب رسالة..." disabled={sending} />
            <Button type="submit" size="icon" disabled={sending || !text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
