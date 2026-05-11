import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

type Status = "validating" | "valid" | "already" | "invalid" | "submitting" | "done" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("validating");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const fnUrl = `${supabaseUrl}/functions/v1/handle-email-unsubscribe`;

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${fnUrl}?token=${encodeURIComponent(token)}`, {
          headers: { apikey: supabaseAnonKey },
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
          return;
        }
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    })();
  }, [token, fnUrl, supabaseAnonKey]);

  const confirm = async () => {
    if (!token) return;
    setStatus("submitting");
    try {
      const res = await fetch(fnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: supabaseAnonKey },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      if (data.success || data.reason === "already_unsubscribed") {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] px-6 py-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(212 98% 62% / 0.4), transparent 60%)" }}
        />
      </div>

      <Card className="relative w-full max-w-md p-10 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          {status === "validating" || status === "submitting" ? (
            <Loader2 className="w-6 h-6 text-cyan-300 animate-spin" />
          ) : status === "done" || status === "already" ? (
            <CheckCircle2 className="w-7 h-7 text-cyan-300" />
          ) : status === "invalid" || status === "error" ? (
            <XCircle className="w-7 h-7 text-red-400" />
          ) : (
            <Mail className="w-6 h-6 text-cyan-300" />
          )}
        </div>

        {status === "validating" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Checking link…</h1>
            <p className="text-white/60 text-sm">One moment while we verify your unsubscribe request.</p>
          </>
        )}

        {status === "valid" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe from TradePeaks?</h1>
            <p className="text-white/60 text-sm mb-8">
              You'll stop receiving emails from us at this address. You can rejoin the waitlist any time from our site.
            </p>
            <Button
              onClick={confirm}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#030712] font-semibold py-6 rounded-xl"
            >
              Confirm Unsubscribe
            </Button>
          </>
        )}

        {status === "submitting" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Processing…</h1>
            <p className="text-white/60 text-sm">Removing you from our list.</p>
          </>
        )}

        {status === "done" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">You're unsubscribed.</h1>
            <p className="text-white/60 text-sm">We're sorry to see you go. The summit is still here whenever you're ready.</p>
          </>
        )}

        {status === "already" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Already unsubscribed</h1>
            <p className="text-white/60 text-sm">This email has already been removed from our list.</p>
          </>
        )}

        {status === "invalid" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Link not valid</h1>
            <p className="text-white/60 text-sm">This unsubscribe link is invalid or has expired.</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-white/60 text-sm mb-6">Please try again in a moment.</p>
            <Button onClick={confirm} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Retry
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
