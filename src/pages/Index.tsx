import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AuthScreen from "@/components/AuthScreen";
import ChatList, { ConversationWithDetails } from "@/components/ChatList";
import ChatInterface from "@/components/ChatInterface";
import AudioCallScreen from "@/components/AudioCallScreen";
import SettingsScreen from "@/components/SettingsScreen";
import NewChatDialog from "@/components/NewChatDialog";

type Screen = "chatList" | "chat" | "settings";

const Index = () => {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>("chatList");
  const [selectedConv, setSelectedConv] = useState<{ id: string; name: string } | null>(null);
  const [showCall, setShowCall] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleSelectChat = (conv: ConversationWithDetails) => {
    setSelectedConv({ id: conv.id, name: conv.otherUserName });
    setScreen("chat");
  };

  const handleNewChatStart = (conversationId: string, contactName: string) => {
    setSelectedConv({ id: conversationId, name: contactName });
    setScreen("chat");
    setShowNewChat(false);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div
        className={`w-full lg:w-80 lg:min-w-[320px] lg:border-r lg:border-border flex-shrink-0 ${
          screen !== "chatList" ? "hidden lg:flex lg:flex-col" : "flex flex-col"
        }`}
      >
        <ChatList
          onSelectChat={handleSelectChat}
          onNewChat={() => setShowNewChat(true)}
          onOpenSettings={() => setScreen("settings")}
          selectedId={selectedConv?.id}
        />
      </div>

      {/* Main content */}
      <div className={`flex-1 flex-col ${screen === "chatList" ? "hidden lg:flex" : "flex"}`}>
        {screen === "settings" ? (
          <SettingsScreen onBack={() => setScreen("chatList")} />
        ) : selectedConv ? (
          <ChatInterface
            conversationId={selectedConv.id}
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
        <NewChatDialog onClose={() => setShowNewChat(false)} onStartChat={handleNewChatStart} />
      )}
    </div>
  );
};

export default Index;
