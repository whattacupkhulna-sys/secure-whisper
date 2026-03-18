import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Shield, Volume2 } from "lucide-react";

interface AudioCallScreenProps {
  contactName: string;
  onEnd: () => void;
}

const AudioCallScreen = ({ contactName, onEnd }: AudioCallScreenProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
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
      {/* Encryption badge */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary">Encrypted Connection Verified</span>
        </div>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Pulsing rings */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-primary/20"
            style={{ margin: "-12px" }}
          />
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 rounded-2xl bg-primary/10"
            style={{ margin: "-24px" }}
          />
          <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center relative z-10">
            <span className="text-3xl font-bold text-foreground">{contactName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground mt-4">{contactName}</h2>
        <span className="text-lg font-mono text-muted-foreground">{formatDuration(duration)}</span>

        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono text-primary">Secure audio channel active</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${
            isMuted ? "bg-muted text-foreground" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-[10px] font-mono">{isMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button
          onClick={onEnd}
          className="w-16 h-16 rounded-xl bg-destructive text-destructive-foreground flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-opacity"
        >
          <PhoneOff className="w-6 h-6" />
          <span className="text-[10px] font-mono">End</span>
        </button>

        <button
          onClick={() => setIsSpeaker(!isSpeaker)}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${
            isSpeaker ? "bg-primary/20 text-primary" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          <Volume2 className="w-5 h-5" />
          <span className="text-[10px] font-mono">Speaker</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AudioCallScreen;
