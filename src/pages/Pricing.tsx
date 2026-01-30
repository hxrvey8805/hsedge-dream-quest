import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import logo from "@/assets/tp-logo.png";

const Pricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#030712]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradePeaks" className="h-10 w-10" />
          </div>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Our Pricing
          </h1>
          <p className="text-xl text-white/50 mb-4">Sign up now.</p>
          <p className="text-2xl font-bold text-white mb-6">Get used to winning</p>
          <p className="text-lg text-white/50 mb-8">
            Our subscription options give you access to everything that TradePeaks has to offer.
          </p>
          
          {/* Yearly Discount Banner */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-sm font-semibold text-blue-400">Get 36% Off When You Pay Yearly</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Yearly Plan */}
          <div 
            className={`p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              isYearly 
                ? 'border-blue-500/50 bg-white/5 backdrop-blur-sm shadow-lg shadow-blue-500/10' 
                : 'border-white/10 bg-white/[0.02]'
            } relative hover:shadow-xl hover:scale-[1.02]`}
            onMouseEnter={() => setIsYearly(true)}
          >
            {isYearly && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg">
                Best Value
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-white">Yearly</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-blue-400">$12</span>
                <span className="text-white/50">/month</span>
              </div>
              <p className="text-sm text-white/50">
                Unlock the full power of TradePeaks with a discount.
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              {[
                "All features +",
                "Trading Calendar",
                "Statistics & Analytics",
                "Dream Builder",
                "Achievements & Levels",
                "Goals Tracking",
                "Risk Management",
                "Strategy Checklist",
                "Equity Curve",
                "Log Your Trade"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="p-1.5 rounded-md bg-blue-500/10">
                    <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  </div>
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              className={`w-full ${isYearly ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`} 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Choose the plan
            </Button>
          </div>

          {/* Monthly Plan */}
          <div 
            className={`p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              !isYearly 
                ? 'border-blue-500/50 bg-white/5 backdrop-blur-sm shadow-lg shadow-blue-500/10' 
                : 'border-white/10 bg-white/[0.02]'
            } relative hover:shadow-xl hover:scale-[1.02]`}
            onMouseEnter={() => setIsYearly(false)}
          >
            {!isYearly && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg">
                Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-white">Monthly</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-blue-400">$19</span>
                <span className="text-white/50">/month</span>
              </div>
              <p className="text-sm text-white/50">
                Best for users looking to try out the platform.
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              {[
                "All features +",
                "Trading Calendar",
                "Statistics & Analytics",
                "Dream Builder",
                "Achievements & Levels",
                "Goals Tracking",
                "Risk Management",
                "Strategy Checklist",
                "Equity Curve",
                "Log Your Trade"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="p-1.5 rounded-md bg-blue-500/10">
                    <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  </div>
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              className={`w-full ${!isYearly ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`} 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Choose the plan
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-white/30">
          <p>© {new Date().getFullYear()} TradePeaks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
