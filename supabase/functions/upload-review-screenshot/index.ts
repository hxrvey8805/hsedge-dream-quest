import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type UploadRequest = {
  tradeId: string;
  slotId: string;
  ext: string;
  contentType: string;
  base64: string;
};

const ALLOWED_EXT = new Set(["png", "jpg", "jpeg", "webp"]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Backend not configured");

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Unauthorized");

    const body = (await req.json()) as UploadRequest;
    const tradeId = (body.tradeId ?? "").trim();
    const slotId = (body.slotId ?? "").trim();
    const ext = (body.ext ?? "").toLowerCase().trim();
    const contentType = (body.contentType ?? "").trim();
    const base64 = (body.base64 ?? "").trim();

    if (!tradeId || !slotId || !ext || !contentType || !base64) {
      throw new Error("Missing required fields");
    }

    if (!ALLOWED_EXT.has(ext)) {
      throw new Error("Unsupported file type");
    }

    if (!contentType.startsWith("image/")) {
      throw new Error("Only image uploads are allowed");
    }

    // Guardrail: avoid extremely large JSON payloads.
    // base64 overhead ~33%, so 10MB base64 ~= 7.5MB binary.
    if (base64.length > 10_000_000) {
      throw new Error("Image too large. Please use a smaller screenshot.");
    }

    const startedAt = Date.now();

    // Decode base64 into bytes.
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const blob = new Blob([bytes], { type: contentType });

    const objectPath = `${user.id}/${tradeId}-${slotId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("review-screenshots")
      .upload(objectPath, blob, { contentType, upsert: true });

    if (uploadError) {
      console.log("[upload-review-screenshot] upload error", {
        userId: user.id,
        tradeId,
        slotId,
        message: uploadError.message,
      });
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("review-screenshots").getPublicUrl(objectPath);

    console.log("[upload-review-screenshot] success", {
      userId: user.id,
      tradeId,
      slotId,
      ext,
      ms: Date.now() - startedAt,
    });

    return new Response(JSON.stringify({ publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("[upload-review-screenshot] error", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
