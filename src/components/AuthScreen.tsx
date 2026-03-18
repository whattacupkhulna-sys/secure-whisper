import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, name, phone || undefined);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email to confirm.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">Cipher</h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">Zero-Knowledge Messaging</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Your name"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">End-to-end encrypted · Zero knowledge</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
