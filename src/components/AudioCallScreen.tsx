import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Shield } from "lucide-react";

interface AudioCallScreenProps {
  contactName: string;
  onEnd: () => void;
}

const AudioCallScreen = ({ contactName, onEnd }: AudioCallScreenProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-between py-16"
    >
      {/* Top */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-mono">Secure Connection</span>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{contactName.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">{contactName}</h2>
        <span className="text-sm font-mono text-muted-foreground">{formatDuration(duration)}</span>

        {/* Pulsing indicator */}
        <div className="relative flex items-center justify-center mt-2">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-3 h-3 rounded-full bg-primary"
          />
          <div className="w-3 h-3 rounded-full bg-primary" />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
            isMuted ? "bg-muted text-foreground" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          onClick={onEnd}
          className="w-16 h-16 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
};

export default AudioCallScreen;
