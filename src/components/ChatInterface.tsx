import { useState, useRef, useEffect } from "react";
import { Phone, ArrowLeft, Clock, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sent: boolean;
  timestamp: string;
}

interface ChatInterfaceProps {
  contactName: string;
  onBack: () => void;
  onCall: () => void;
}

const MOCK_MESSAGES: Message[] = [
  { id: "1", text: "Hey, are you available for a call?", sent: false, timestamp: "10:32" },
  { id: "2", text: "Yes, give me 5 minutes.", sent: true, timestamp: "10:33" },
  { id: "3", text: "Sure, I'll ping you then.", sent: false, timestamp: "10:33" },
  { id: "4", text: "Sounds good. Talk soon.", sent: true, timestamp: "10:34" },
];

const ChatInterface = ({ contactName, onBack, onCall }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            <span className="text-xs font-mono text-muted-foreground">10d</span>
          </div>
        </div>
        <button
          onClick={onCall}
          className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                msg.sent
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground border border-border"
              }`}
              style={{ borderRadius: "8px" }}
            >
              <p>{msg.text}</p>
              <p className={`text-[10px] font-mono mt-1 ${msg.sent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
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
            placeholder="Type a message..."
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
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
