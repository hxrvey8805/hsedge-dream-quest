import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Target, TrendingUp, Trophy, Zap } from "lucide-react";
import logo from "@/assets/hs-logo.png";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <header className="border-b border-blue-800/30 bg-blue-950/50 backdrop-blur-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
            <span className="text-xl font-bold"></span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={() => navigate("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="container mx-auto px-4 pt-16 md:pt-24 pb-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-7xl md:text-8xl font-light italic" style={{
              fontFamily: "'Playfair Display', 'Dancing Script', 'Georgia', serif",
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(96, 165, 250, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
              letterSpacing: '0.08em',
              fontWeight: 300,
              filter: 'drop-shadow(0 0 30px rgba(96, 165, 250, 0.4))'
            }}>TradeLucid</h1>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-blue-200 to-blue-400 bg-clip-text text-transparent animate-fade-in">
              Your Gamified, Dream-Driven Path to Trading Excellence
            </h2>
            <p className="text-xl text-blue-100/90 mb-8 animate-fade-in">
              Transform your trading journey with Lucid. Track every trade, build your dreams, and level up your
              skills with our gamified trading journal.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in">
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(96,165,250,0.3)] hover:border-blue-600/50 transition-all">
              <div className="inline-flex p-4 rounded-full bg-blue-500/20 mb-4">
                <Trophy className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Gamified Progress</h3>
              <p className="text-blue-100/80">
                Earn achievements, level up, and track your trading milestones with our gamification system.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(96,165,250,0.3)] hover:border-blue-600/50 transition-all">
              <div className="inline-flex p-4 rounded-full bg-blue-500/20 mb-4">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Dream Builder</h3>
              <p className="text-blue-100/80">
                Define your trading dreams, set milestones, and visualize your path to success.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(96,165,250,0.3)] hover:border-blue-600/50 transition-all">
              <div className="inline-flex p-4 rounded-full bg-blue-500/20 mb-4">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Advanced Analytics</h3>
              <p className="text-blue-100/80">
                Deep insights into your trading patterns, win rates, and performance metrics.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl border border-blue-600/30 bg-blue-950/40 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-400/5"></div>
            <div className="relative">
              <Zap className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform Your Trading?</h2>
              <p className="text-xl text-blue-100/90 mb-8">
                Join Lucid today and start your journey to becoming a consistently profitable trader.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                Start Free Trial Today
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-blue-800/30 bg-blue-950/40 backdrop-blur-sm mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center text-blue-200/70">
          <p>© 2025 TradeLucid. All rights reserved.</p>
        </div>
      </footer>
    </div>;
};
export default Index;