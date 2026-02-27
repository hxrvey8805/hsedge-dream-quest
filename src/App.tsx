import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DreamBuilder from "./pages/DreamBuilder";
import Statistics from "./pages/Statistics";
import Accounts from "./pages/Accounts";
import Goals from "./pages/Goals";
import Pricing from "./pages/Pricing";
import TradingRooms from "./pages/TradingRooms";
import NotFound from "./pages/NotFound";
import Playbooks from "./pages/Playbooks";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/playbooks" element={<Playbooks />} />
          {/* All app pages share the persistent header via AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/dream-builder" element={<DreamBuilder />} />
            <Route path="/rooms" element={<TradingRooms />} />
            <Route path="/achievements" element={<Accounts />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
