import { useState, useRef, useEffect, useCallback } from "react";
import { Phone, ArrowLeft, Clock, Send, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  expires_at: string;
}

interface ChatInterfaceProps {
  conversationId: string;
  contactName: string;
  onBack: () => void;
  onCall: () => void;
}

const ChatInterface = ({ conversationId, contactName, onBack, onCall }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };
    fetchMessages();
  }, [conversationId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });

    if (error) {
      toast.error("Failed to send message");
      setInput(content);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Block paste of media
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/") || items[i].type.startsWith("video/")) {
        e.preventDefault();
        toast.error("Media sharing is disabled for your security.");
        return;
      }
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors lg:hidden">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold text-sm">
          {contactName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{contactName}</p>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">10d auto-delete</span>
          </div>
        </div>
        <button
          onClick={onCall}
          className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          title="Secure Audio Call"
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {/* Security banner */}
      <div className="flex items-center justify-center gap-1.5 py-1.5 bg-primary/5 border-b border-border">
        <Shield className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-mono text-primary">End-to-end encrypted</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isSent = msg.sender_id === user?.id;
          const daysLeft = getDaysLeft(msg.expires_at);
          return (
            <div key={msg.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 text-sm ${
                  isSent
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border"
                }`}
                style={{ borderRadius: "8px" }}
              >
                <p>{msg.content}</p>
                <div className={`flex items-center gap-2 mt-1 ${isSent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  <span className="text-[10px] font-mono">{formatTime(msg.created_at)}</span>
                  <span className="text-[10px] font-mono">· {daysLeft}d left</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message..."
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
