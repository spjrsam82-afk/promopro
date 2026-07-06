    const url = new URL(request.url);

    // Example: API route
    if (url.pathname.startsWith("/api/")) {
      // Use env.CJ_COMPANY_ID, env.CJ_PERSONAL_TOKEN, env.GEMINI_API_KEY here
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fall through to static assets
    return fetch(request);
  },
};
