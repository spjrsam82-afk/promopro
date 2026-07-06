import { env } from "cloudflare:workers";

// Initialize at top-level scope — runs once when the Worker cold-starts
// Replace with your actual API client setup
const LOG_LEVEL = env.LOG_LEVEL || "info";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Example API route — use your existing secrets
    if (url.pathname.startsWith("/api/")) {
      // env.CJ_COMPANY_ID, env.CJ_PERSONAL_TOKEN, env.GEMINI_API_KEY are available
      return new Response(JSON.stringify({ ok: true, level: LOG_LEVEL }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fall through to static assets (your Vite build output in dist/)
    return fetch(request);
  },
};
