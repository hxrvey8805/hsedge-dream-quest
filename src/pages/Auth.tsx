import { useState, useEffect, useMemo, useRef } from "react";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse position for magnetic particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate floating particles matching homepage
  const lucidParticles = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 25,
      size: Math.random() * 6 + 3,
      opacity: 0.5 + Math.random() * 0.5,
      driftX: Math.random() * 150 - 75,
      driftY: Math.random() * 100 + 50,
      magnetStrength: 0.15 + Math.random() * 0.2,
    }));
  }, []);

  // Calculate magnetic offset for each particle
  const getParticleStyle = (particle: typeof lucidParticles[0]) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const particleX = (particle.baseX / 100) * rect.width;
    const particleY = (particle.baseY / 100) * rect.height;
    
    const dx = mousePos.x - particleX;
    const dy = mousePos.y - particleY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxDistance = 350;
    const strength = Math.max(0, 1 - distance / maxDistance) * particle.magnetStrength;
    
    return {
      x: dx * strength * 0.5,
      y: dy * strength * 0.5,
    };
  };

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
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-[#070C1A] p-4 relative overflow-hidden">
      {/* Radial gradient overlay background - matching homepage */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(
              80rem 40rem at 50% -10%,
              rgba(16, 40, 90, 0.55),
              transparent 60%
            ),
            radial-gradient(
              60rem 30rem at 50% 120%,
              rgba(7, 12, 26, 0.8),
              transparent 60%
            )
          `
        }}
      />
      
      {/* Floating particles - matching homepage */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {lucidParticles.map((particle) => {
          const magnetOffset = getParticleStyle(particle);
          return (
            <div
              key={particle.id}
              className="lucid-particle"
              style={{
                left: `${particle.baseX}%`,
                top: `${particle.baseY}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                '--drift-x': `${particle.driftX}px`,
                '--drift-y': `${particle.driftY}px`,
                transform: `translate(${magnetOffset.x}px, ${magnetOffset.y}px)`,
                transition: 'transform 0.3s ease-out',
              } as React.CSSProperties}
            />
          );
        })}
      </div>

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
