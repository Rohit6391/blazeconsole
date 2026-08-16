export const SITE = {
  name: "BlazeConsole",
  org: "ShortCodeGuy Studio",
  tagline: "The AI API for the Blaze ecosystem.",
  description: "A developer-focused AI API built for the Blaze ecosystem.",
  url: "https://blazeconsole.netlify.app",
  apiEndpoint: "/api/v1/chat",
  apiFullUrl: "https://blazeconsole.netlify.app/api/v1/chat",
  github: "https://github.com/shortcodeguy",
  supportEmail: "shortcodeguystudio@gmail.com",
} as const;

export const MODEL = {
  id: "blaze-v1",
  name: "Blaze v1",
  status: "Available",
  description: "Blaze v1 is the public AI model exposed through BlazeConsole.",
  contextWindow: "8,192 output tokens",
} as const;

export const API_ERRORS = [
  { code: "INVALID_REQUEST", message: "The request body or fields were malformed." },
  { code: "MODEL_NOT_FOUND", message: "The requested model is not available." },
  { code: "METHOD_NOT_ALLOWED", message: "Only POST requests are supported." },
  { code: "UNAUTHORIZED", message: "Authentication is missing or invalid." },
  { code: "RATE_LIMITED", message: "Too many requests. Try again later." },
  { code: "UPSTREAM_ERROR", message: "The AI backend returned an error." },
  { code: "AI_SERVICE_UNAVAILABLE", message: "The AI service could not be reached." },
  { code: "INTERNAL_ERROR", message: "An unexpected internal error occurred." },
] as const;
