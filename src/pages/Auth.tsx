import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/hs-logo.png";
import LucidAnimation from "@/components/LucidAnimation";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const priceId = searchParams.get("price");
  const planName = searchParams.get("plan");
  
  const [isLogin, setIsLogin] = useState(!priceId); // Default to signup if coming from pricing
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
        
        // If user signed up from pricing page, redirect to checkout
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
        
        // If user signed up and got a session (no priceId), show animation
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="HS-Edge" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : planName ? `Get Started with ${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan` : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to continue your trading journey" : "Start your gamified trading journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
