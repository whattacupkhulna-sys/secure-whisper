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
    setCreating(true);

    // Check if conversation already exists
    const { data: myParticipations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (myParticipations) {
      for (const p of myParticipations) {
        const { data: otherP } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", p.conversation_id)
          .eq("user_id", targetUserId)
          .single();

        if (otherP) {
          onStartChat(p.conversation_id, targetName);
          setCreating(false);
          return;
        }
      }
    }

    // Create new conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({})
      .select("id")
      .single();

    if (convError || !conv) {
      toast.error("Failed to create conversation");
      setCreating(false);
      return;
    }

    // Add both participants
    const { error: partError } = await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: targetUserId },
    ]);

    if (partError) {
      toast.error("Failed to add participants");
      setCreating(false);
      return;
    }

    onStartChat(conv.id, targetName);
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
