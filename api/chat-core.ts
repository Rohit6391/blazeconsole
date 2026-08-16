/**
 * BlazeConsole public API — core request handler.
 *
 * Platform-agnostic: accepts a standard Request and returns a Response.
 * Wrapped by the Netlify function (netlify/functions/api-chat.ts) and the
 * Vite dev middleware (vite.config.ts) so the same logic runs in both.
 *
 * Flow: public { model, message } -> transform -> existing Supabase Edge
 * Function (Firebase-authenticated, session-scoped) -> normalize -> client.
 */

export const PUBLIC_MODEL_ID = "blaze-v1";
export const PUBLIC_MODEL_NAME = "Blaze v1";
const UPSTREAM_URL =
  (typeof process !== "undefined" && process.env?.SUPABASE_EDGE_URL) ||
  "https://eczymonozwinjbzzfwbt.supabase.co/functions/v1/chat";

const MAX_MESSAGE_LENGTH = 8000;
const MAX_BODY_BYTES = 32768;

/** Server-side credentials required to talk to the existing Edge Function. */
interface ServiceCreds {
  firebaseApiKey: string;
  serviceEmail: string;
  servicePassword: string;
  sessionId: string;
}

function getCreds(): ServiceCreds | null {
  const env = typeof process !== "undefined" ? process.env : ({} as Record<string, string | undefined>);
  const firebaseApiKey = env.FIREBASE_API_KEY;
  const serviceEmail = env.BLAZE_SERVICE_EMAIL;
  const servicePassword = env.BLAZE_SERVICE_PASSWORD;
  const sessionId = env.BLAZE_SESSION_ID;
  if (!firebaseApiKey || !serviceEmail || !servicePassword || !sessionId) return null;
  return { firebaseApiKey, serviceEmail, servicePassword, sessionId };
}

// ---------------------------------------------------------------------------
// Firebase ID token management (server-side only)
// ---------------------------------------------------------------------------
interface TokenCache {
  idToken: string;
  expiresAt: number; // ms epoch
}

let tokenCache: TokenCache | null = null;

async function fetchFirebaseIdToken(creds: ServiceCreds): Promise<string> {
  // Reuse cached token with a 5-minute safety buffer.
  if (tokenCache && Date.now() < tokenCache.expiresAt - 5 * 60 * 1000) {
    return tokenCache.idToken;
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${creds.firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: creds.serviceEmail,
        password: creds.servicePassword,
        returnSecureToken: true,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[blazeconsole] Firebase signIn failed:", res.status, text);
    throw new Error("Firebase authentication failed");
  }

  const data = (await res.json()) as { idToken: string; expiresIn: string };
  const expiresInSec = parseInt(data.expiresIn, 10) || 3600;
  tokenCache = {
    idToken: data.idToken,
    expiresAt: Date.now() + expiresInSec * 1000,
  };
  return data.idToken;
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------
interface ApiErrorBody {
  error: { code: string; message: string };
}

function errorResponse(code: string, message: string, status: number, extraHeaders?: Record<string, string>): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...extraHeaders,
    },
  });
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
interface PublicRequest {
  model?: unknown;
  message?: unknown;
}

function validatePublicRequest(parsed: PublicRequest): { ok: true; message: string } | { ok: false; code: string; message: string } {
  if (typeof parsed.model !== "string" || parsed.model.trim() === "") {
    return { ok: false, code: "INVALID_REQUEST", message: "The model field is required." };
  }
  if (parsed.model !== PUBLIC_MODEL_ID) {
    return { ok: false, code: "MODEL_NOT_FOUND", message: `Only ${PUBLIC_MODEL_ID} is currently available.` };
  }
  if (typeof parsed.message !== "string" || parsed.message.trim() === "") {
    return { ok: false, code: "INVALID_REQUEST", message: "The message field is required." };
  }
  if (parsed.message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      code: "INVALID_REQUEST",
      message: `The message exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }
  return { ok: true, message: parsed.message };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
export async function handleChat(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse("METHOD_NOT_ALLOWED", "Only POST requests are supported.", 405, { Allow: "POST" });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return errorResponse("INVALID_REQUEST", "Content-Type must be application/json.", 415);
  }

  // Body size guard
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength && contentLength > MAX_BODY_BYTES) {
    return errorResponse("INVALID_REQUEST", "Request body too large.", 413);
  }

  const rawText = await req.text();
  if (rawText.length > MAX_BODY_BYTES) {
    return errorResponse("INVALID_REQUEST", "Request body too large.", 413);
  }

  let parsed: PublicRequest;
  try {
    parsed = JSON.parse(rawText) as PublicRequest;
  } catch {
    return errorResponse("INVALID_REQUEST", "Invalid JSON in request body.", 400);
  }

  const validation = validatePublicRequest(parsed);
  if (!validation.ok) {
    return errorResponse(validation.code, validation.message, validation.code === "MODEL_NOT_FOUND" ? 404 : 400);
  }

  const creds = getCreds();
  if (!creds) {
    console.error("[blazeconsole] Missing server-side credentials. Required: FIREBASE_API_KEY, BLAZE_SERVICE_EMAIL, BLAZE_SERVICE_PASSWORD, BLAZE_SESSION_ID");
    return errorResponse(
      "AI_SERVICE_UNAVAILABLE",
      "BlazeConsole is not fully configured. Service credentials are missing.",
      503,
    );
  }

  let idToken: string;
  try {
    idToken = await fetchFirebaseIdToken(creds);
  } catch {
    return errorResponse("UPSTREAM_ERROR", "Failed to authenticate with the backend service.", 502);
  }

  // Transform public request -> existing Edge Function's expected shape.
  // skipUserPersist keeps the shared service session stateless so each
  // public request is independent (matches the { model, message } contract).
  const upstreamBody = {
    sessionId: creds.sessionId,
    messages: [{ role: "user", content: validation.message }],
    skipUserPersist: true,
    webSearch: false,
  };

  let upstream: Response;
  try {
    upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(upstreamBody),
      signal: req.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return new Response(null, { status: 499, headers: CORS_HEADERS });
    }
    console.error("[blazeconsole] Upstream fetch error:", err);
    return errorResponse("AI_SERVICE_UNAVAILABLE", "Could not reach the AI backend.", 503);
  }

  // Map upstream status codes to public errors when not successful.
  if (!upstream.ok) {
    const status = upstream.status;
    if (status === 401) {
      return errorResponse("UPSTREAM_ERROR", "Backend authentication failed.", 502);
    }
    if (status === 404) {
      return errorResponse("AI_SERVICE_UNAVAILABLE", "The AI service session is unavailable.", 503);
    }
    if (status === 429) {
      const body = await upstream.json().catch(() => ({})) as { error?: string };
      return errorResponse("RATE_LIMITED", body.error || "Rate limit reached. Please try again later.", 429);
    }
    if (status >= 500) {
      return errorResponse("UPSTREAM_ERROR", "The AI backend returned an error.", 502);
    }
    return errorResponse("UPSTREAM_ERROR", "The AI backend rejected the request.", 502);
  }

  const upstreamContentType = upstream.headers.get("content-type") ?? "";

  // ---- Streaming pass-through (text/event-stream) ----
  if (upstreamContentType.includes("text/event-stream") && upstream.body) {
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // ---- Non-streaming fallback ----
  // The Edge Function may return a JSON error even with a 200 in rare cases;
  // normalize whatever it returns into the public response shape.
  const data = await upstream.json().catch(() => null) as
    | { error?: string; choices?: Array<{ message?: { content?: string } }> }
    | null;

  if (!data) {
    return errorResponse("UPSTREAM_ERROR", "Received an empty response from the AI backend.", 502);
  }

  if (data.error && !data.choices) {
    return errorResponse("UPSTREAM_ERROR", "The AI backend returned an error.", 502);
  }

  const responseText = data.choices?.[0]?.message?.content ?? "";
  return new Response(JSON.stringify({ model: PUBLIC_MODEL_ID, response: responseText }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// ---------------------------------------------------------------------------
// Health check (used by /status page)
// ---------------------------------------------------------------------------
export async function healthCheck(): Promise<{ ok: boolean; detail: string }> {
  const creds = getCreds();
  if (!creds) {
    return { ok: false, detail: "Service credentials not configured" };
  }

  try {
    const idToken = await fetchFirebaseIdToken(creds);
    // Lightweight probe: send a tiny message to confirm the full pipeline works.
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        sessionId: creds.sessionId,
        messages: [{ role: "user", content: "ping" }],
        skipUserPersist: true,
        webSearch: false,
      }),
      // Don't follow the stream — we just need the headers/status.
    });

    if (upstream.ok) {
      // Consume/discard the body so the connection doesn't hang.
      upstream.body?.cancel();
      return { ok: true, detail: "Pipeline reachable" };
    }
    if (upstream.status === 429) {
      // Rate limited but the service IS up — treat as degraded but reachable.
      upstream.body?.cancel();
      return { ok: true, detail: "Pipeline reachable (rate limit active on service account)" };
    }
    return { ok: false, detail: `Backend responded ${upstream.status}` };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "Unknown error" };
  }
}
