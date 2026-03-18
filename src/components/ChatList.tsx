import { useEffect, useState, useCallback } from "react";
import { Clock, Settings, Plus, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ConversationWithDetails {
  id: string;
  otherUserName: string;
  otherUserId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatListProps {
  onSelectChat: (conv: ConversationWithDetails) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  selectedId?: string;
}

const ChatList = ({ onSelectChat, onNewChat, onOpenSettings, selectedId }: ChatListProps) => {
  const { user, signOut } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participations?.length) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convIds = participations.map((p) => p.conversation_id);

    const convDetails: ConversationWithDetails[] = [];

    for (const convId of convIds) {
      // Get other participant
      const { data: otherParticipants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", convId)
        .neq("user_id", user.id);

      if (!otherParticipants?.length) continue;

      const otherUserId = otherParticipants[0].user_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", otherUserId)
        .single();

      // Get last message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      convDetails.push({
        id: convId,
        otherUserName: profile?.display_name || "Unknown",
        otherUserId,
        lastMessage: lastMsg?.content || "",
        lastMessageTime: lastMsg
          ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        unreadCount: 0,
      });
    }

    setConversations(convDetails);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Subscribe to new messages for refresh
    const channel = supabase
      .channel("chat-list-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-lg font-bold text-foreground font-display">Cipher</h1>
        <div className="flex items-center gap-2">
          <button onClick={onNewChat} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={onOpenSettings} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={signOut} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-mono text-muted-foreground">All messages auto-delete after 10 days</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <p className="text-sm text-center">No conversations yet.</p>
            <button onClick={onNewChat} className="text-primary text-sm mt-2 hover:underline">Start a new chat</button>
          </div>
        ) : (
          conversations.map((conv) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              onClick={() => onSelectChat(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 ${
                selectedId === conv.id ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                {conv.otherUserName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">{conv.otherUserName}</span>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{conv.lastMessageTime}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
