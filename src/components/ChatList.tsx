import { Clock, Settings, Plus } from "lucide-react";
import { motion } from "framer-motion";

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface ChatListProps {
  conversations: Conversation[];
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  selectedId?: string;
}

const ChatList = ({ conversations, onSelectChat, onNewChat, onOpenSettings, selectedId }: ChatListProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-lg font-bold text-foreground font-display">Cipher</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auto-delete banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-mono text-muted-foreground">All messages auto-delete after 10 days</span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <p className="text-sm text-center">No conversations yet.</p>
            <button onClick={onNewChat} className="text-primary text-sm mt-2 hover:underline">
              Start a new chat
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              onClick={() => onSelectChat(conv.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 ${
                selectedId === conv.id ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                {conv.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">{conv.name}</span>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{conv.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold shrink-0">
                  {conv.unread}
                </span>
              )}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
