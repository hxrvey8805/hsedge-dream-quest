import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/hs-logo.png";
import LucidAnimation from "@/components/LucidAnimation";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const priceId = searchParams.get("price");
  const planName = searchParams.get("plan");
  
  const [isLogin, setIsLogin] = useState(!priceId);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setShowAnimation(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        setShowAnimation(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        
        if (error) {
          console.error("Sign in error:", error);
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Please confirm your email address");
          } else {
            toast.error(error.message);
          }
          return;
        }
        
        if (data.session) {
          toast.success("Welcome back!");
          setShowAnimation(true);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) {
          console.error("Sign up error:", error);
          toast.error(error.message);
          return;
        }
        
        toast.success("Account created!");
        
        if (priceId && data.session) {
          const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
            body: { priceId }
          });
          
          if (checkoutError) {
            toast.error("Failed to create checkout session");
            console.error(checkoutError);
            return;
          }
          
          if (checkoutData?.url) {
            window.location.href = checkoutData.url;
            return;
          }
        }
        
        if (!priceId && data.session) {
          setShowAnimation(true);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message.includes("fetch")) {
        toast.error("Network error - please check your connection");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    navigate("/dashboard");
  };

  if (showAnimation) {
    return <LucidAnimation onComplete={handleAnimationComplete} duration={3000} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="ambient-orb w-[500px] h-[500px] bg-primary/20 -top-48 -left-48" style={{ animationDelay: '0s' }} />
      <div className="ambient-orb w-[400px] h-[400px] bg-accent/15 -bottom-32 -right-32" style={{ animationDelay: '4s' }} />
      <div className="ambient-orb w-[300px] h-[300px] bg-primary/10 top-1/2 left-1/4" style={{ animationDelay: '8s' }} />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Premium card */}
        <div className="premium-card rounded-2xl p-8 relative">
          {/* Header */}
          <div className="space-y-6 text-center mb-8">
            <div className="flex justify-center">
              <img 
                src={logo} 
                alt="HS-Edge" 
                className="h-20 w-20 animate-logo-float" 
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight animate-text-reveal bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                {isLogin ? "Welcome Back" : planName ? `Get Started with ${planName.charAt(0).toUpperCase() + planName.slice(1)}` : "Create Account"}
              </h1>
              <p className="text-muted-foreground animate-text-reveal-delay-1">
                {isLogin ? "Sign in to continue your trading journey" : "Start your gamified trading journey"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2 animate-text-reveal-delay-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="premium-input h-12 rounded-xl px-4"
              />
            </div>
            <div className="space-y-2 animate-text-reveal-delay-3">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="premium-input h-12 rounded-xl px-4"
              />
            </div>
            <div className="flex gap-3 pt-2 animate-text-reveal-delay-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 border-border/50 hover:bg-secondary/50 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 rounded-xl premium-button text-primary-foreground font-medium" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </div>
          </form>

          {/* Toggle link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-primary group-hover:underline underline-offset-4">
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
