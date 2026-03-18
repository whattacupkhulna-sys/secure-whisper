import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuthScreen from "@/components/AuthScreen";
import ChatList, { Conversation } from "@/components/ChatList";
import ChatInterface from "@/components/ChatInterface";
import AudioCallScreen from "@/components/AudioCallScreen";
import SettingsScreen from "@/components/SettingsScreen";
import NewChatDialog from "@/components/NewChatDialog";

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Alice Nguyen", lastMessage: "Talk soon.", timestamp: "10:34", unread: 1 },
  { id: "2", name: "Bob Martinez", lastMessage: "Got it, thanks.", timestamp: "09:15", unread: 0 },
  { id: "3", name: "Charlie Park", lastMessage: "Let me check on that.", timestamp: "Yesterday", unread: 3 },
];

type Screen = "chatList" | "chat" | "settings";

const Index = () => {
  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [screen, setScreen] = useState<Screen>("chatList");
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showCall, setShowCall] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  const selectedConv = conversations.find((c) => c.id === selectedChatId);

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    setScreen("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleNewChat = (name: string) => {
    const existing = conversations.find((c) => c.name === name);
    if (existing) {
      handleSelectChat(existing.id);
    } else {
      const newConv: Conversation = {
        id: Date.now().toString(),
        name,
        lastMessage: "",
        timestamp: "Now",
        unread: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedChatId(newConv.id);
      setScreen("chat");
    }
    setShowNewChat(false);
  };

  // Desktop two-pane layout
  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - always visible on desktop, hidden on mobile when in chat/settings */}
      <div
        className={`w-full lg:w-80 lg:min-w-[320px] lg:border-r lg:border-border flex-shrink-0 ${
          screen !== "chatList" ? "hidden lg:flex lg:flex-col" : "flex flex-col"
        }`}
      >
        <ChatList
          conversations={conversations}
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowNewChat(true)}
          onOpenSettings={() => setScreen("settings")}
          selectedId={selectedChatId ?? undefined}
        />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex-col ${
          screen === "chatList" ? "hidden lg:flex" : "flex"
        }`}
      >
        {screen === "settings" ? (
          <SettingsScreen userName={user.name} onBack={() => setScreen("chatList")} />
        ) : selectedConv ? (
          <ChatInterface
            contactName={selectedConv.name}
            onBack={() => setScreen("chatList")}
            onCall={() => setShowCall(true)}
          />
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground">
            <p className="text-sm font-mono">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showCall && selectedConv && (
          <AudioCallScreen contactName={selectedConv.name} onEnd={() => setShowCall(false)} />
        )}
      </AnimatePresence>

      {showNewChat && (
        <NewChatDialog onClose={() => setShowNewChat(false)} onStartChat={handleNewChat} />
      )}
    </div>
  );
};

export default Index;
