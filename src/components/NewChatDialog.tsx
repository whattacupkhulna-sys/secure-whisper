import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";

interface NewChatDialogProps {
  onClose: () => void;
  onStartChat: (name: string) => void;
}

const MOCK_CONTACTS = [
  { id: "c1", name: "Alice Nguyen" },
  { id: "c2", name: "Bob Martinez" },
  { id: "c3", name: "Charlie Park" },
  { id: "c4", name: "Diana Rossi" },
];

const NewChatDialog = ({ onClose, onStartChat }: NewChatDialogProps) => {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full bg-muted border border-border rounded-lg pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onStartChat(contact.name)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold text-sm">
                {contact.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-foreground">{contact.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No contacts found</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewChatDialog;
