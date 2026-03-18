import { ArrowLeft, Shield, Clock, Mic, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email || "User";

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground font-mono">Zero-Knowledge User</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Privacy Status
          </h3>
          <div className="space-y-2">
            <StatusRow icon={<Lock className="w-3.5 h-3.5" />} label="End-to-End Encryption" status="Active" />
            <StatusRow icon={<Shield className="w-3.5 h-3.5" />} label="Zero-Knowledge Architecture" status="Enabled" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Permissions</h3>
          <div className="space-y-2">
            <StatusRow icon={<Mic className="w-3.5 h-3.5" />} label="Microphone (calls only)" status="Allowed" />
            <div className="text-xs text-muted-foreground font-mono px-1">No gallery, camera, or contact access</div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Data Retention
          </h3>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-foreground font-medium">10-Day Auto-Deletion</p>
            <p className="text-xs text-muted-foreground mt-1">
              All messages are permanently and irrecoverably deleted 10 days after being sent. This cannot be disabled.
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full bg-destructive/10 text-destructive rounded-lg py-3 text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const StatusRow = ({ icon, label, status }: { icon: React.ReactNode; label: string; status: string }) => (
  <div className="flex items-center justify-between py-1.5 px-1">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-xs font-mono text-primary">{status}</span>
  </div>
);

export default SettingsScreen;
