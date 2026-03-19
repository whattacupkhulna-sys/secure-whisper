import { useState } from "react";
import { ArrowLeft, Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NewChatDialogProps {
  onClose: () => void;
  onStartChat: (conversationId: string, contactName: string) => void;
}

interface SearchResult {
  user_id: string;
  display_name: string;
}

const NewChatDialog = ({ onClose, onStartChat }: NewChatDialogProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .neq("user_id", user?.id)
      .ilike("display_name", `%${query}%`)
      .limit(10);

    setResults(data || []);
    setSearching(false);
  };

  const handleStartChat = async (targetUserId: string, targetName: string) => {
    if (!user || creating) return;

    if (targetUserId === user.id) {
      toast.error("Can't start a chat with yourself");
      return;
    }

    setCreating(true);

    // Check if conversation already exists for the two users
    const { data: myParticipations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (myParticipations?.length) {
      const conversationIds = myParticipations.map((p) => p.conversation_id);
      const { data: shared } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .eq("user_id", targetUserId)
        .limit(1);

      if (shared?.length) {
        onStartChat(shared[0].conversation_id, targetName);
        setCreating(false);
        return;
      }
    }

    // Create new conversation (avoid needing to SELECT it back; RLS can block reading immediately)
    const conversationId = crypto.randomUUID();
    const { error: convError } = await supabase
      .from("conversations")
      .insert({ id: conversationId }, { returning: "minimal" });

    if (convError) {
      console.error("Failed to create conversation", convError);
      toast.error(
        `Failed to create conversation: ${convError.message} ${convError.details ?? ""}`.trim()
      );
      setCreating(false);
      return;
    }

    // Add the current user first (RLS allows this), then add the other user
    const { error: partErrorSelf } = await supabase.from("conversation_participants").insert([
      { conversation_id: conversationId, user_id: user.id },
    ]);

    if (partErrorSelf) {
      console.error("Failed to add self to conversation", partErrorSelf);
      toast.error(
        `Failed to add yourself to conversation: ${partErrorSelf.message} ${partErrorSelf.details ?? ""}`.trim()
      );
      setCreating(false);
      return;
    }

    const { error: partErrorOther } = await supabase.from("conversation_participants").insert([
      { conversation_id: conversationId, user_id: targetUserId },
    ]);

    if (partErrorOther) {
      console.error("Failed to add participant", partErrorOther);
      toast.error(
        `Failed to add participant: ${partErrorOther.message} ${partErrorOther.details ?? ""}`.trim()
      );
      setCreating(false);
      return;
    }

    onStartChat(conversationId, targetName);
    setCreating(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-background flex flex-col"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">New Chat</h2>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
            {search && (
              <button onClick={() => { setSearch(""); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <button
                key={r.user_id}
                onClick={() => handleStartChat(r.user_id, r.display_name)}
                disabled={creating}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold text-sm">
                  {r.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{r.display_name}</span>
              </button>
            ))
          ) : search.length >= 2 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">Type at least 2 characters to search</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewChatDialog;
