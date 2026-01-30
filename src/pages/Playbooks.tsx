import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, Zap, TrendingUp } from "lucide-react";
import logo from "@/assets/tp-logo.png";

const playbooks = [
  {
    id: "premarket-momentum",
    title: "Premarket Momentum Hunt",
    timeWindow: "12:00 - 14:30",
    icon: Zap,
    description: "Capture early momentum before the market opens. Learn to identify high-probability setups during the premarket session.",
    color: "from-amber-500/20 to-orange-600/20",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    id: "golden-window",
    title: "The Golden Window",
    timeWindow: "14:30 - 15:00",
    icon: TrendingUp,
    description: "The most lucrative 30 minutes of the trading day. Master the art of trading the market open with precision.",
    color: "from-yellow-500/20 to-amber-600/20",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-400",
  },
  {
    id: "second-wave",
    title: "Second Wave Scalps",
    timeWindow: "15:00 - 17:00",
    icon: Clock,
    description: "Ride the secondary momentum waves. Learn to scalp effectively during the mid-day trading session.",
    color: "from-blue-500/20 to-cyan-600/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
];

export default function Playbooks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#030712]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logo} alt="TradePeaks" className="h-8 w-8" />
            <span className="text-lg font-semibold text-white">Playbooks</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 px-[5%]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/70">Real Trading Education</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Trading isn't about quick wins.
          </h1>

          <div className="space-y-4 text-white/60 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            <p>
              The majority of strategies online consist of gambling and luck, setups that would get you fired from a real proprietary trading firm.
            </p>
            <p>
              Real trading education is about <span className="text-white font-medium">process</span>, <span className="text-white font-medium">journaling</span>, <span className="text-white font-medium">playbooking</span> and <span className="text-white font-medium">risk control</span>, not just flashy entries and exits.
            </p>
            <p className="text-blue-400">
              TradePeaks is where you'll find real education, not hype.
            </p>
          </div>
        </div>
      </section>

      {/* Playbooks Grid */}
      <section className="py-12 lg:py-20 px-[5%]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            The Books of Knowledge
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {playbooks.map((playbook) => {
              const IconComponent = playbook.icon;
              return (
                <Card
                  key={playbook.id}
                  className={`group relative bg-gradient-to-b ${playbook.color} border ${playbook.borderColor} p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden`}
                >
                  {/* Book spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-white/10 to-white/5" />
                  
                  {/* Book pages effect */}
                  <div className="absolute right-1 top-4 bottom-4 w-1 bg-white/5 rounded-r" />
                  <div className="absolute right-2 top-6 bottom-6 w-0.5 bg-white/3 rounded-r" />

                  <div className="relative z-10 pl-2">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${playbook.iconColor}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>

                    {/* Time window badge */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 mb-4">
                      <Clock className="h-3 w-3 text-white/50" />
                      <span className="text-xs text-white/70 font-mono">{playbook.timeWindow}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-white/90 transition-colors">
                      {playbook.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/50 leading-relaxed">
                      {playbook.description}
                    </p>

                    {/* Coming soon indicator */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <span className="text-xs text-white/30 uppercase tracking-wider">Coming Soon</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-[5%] border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/50 mb-6">
            Ready to trade with a real edge?
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-medium"
          >
            Join TradePeaks
          </Button>
        </div>
      </section>
    </div>
  );
}
