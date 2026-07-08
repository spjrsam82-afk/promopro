export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle CORS Preflight Requests (The Handshake)
    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // Keep searchInput scoped outside the try block so the error logger can always see it
    let searchInput = "Unknown";

    try {
        // 1. AUDIT: Validate Environment Variables Up Front
        const requiredEnv = [
            "GEMINI_API_KEY",
            "CJ_COMPANY_ID",
            "CJ_PERSONAL_TOKEN"
        ];

        for (const key of requiredEnv) {
            if (!env[key]) {
                throw new Error(`Missing environment variable: ${key}`);
            }
        }

        // 2. AUDIT: Validate the Request Body
        let body;
        try {
            body = await request.json();
        } catch {
            return new Response(JSON.stringify({
                success: false,
                message: "Invalid JSON request."
            }), {
                status: 400, headers: corsHeaders
            });
        }

        searchInput = body.search?.trim();

        if (!searchInput) {
            return new Response(JSON.stringify({ success: false, message: "No search term provided." }), {
                status: 400, headers: corsHeaders
            });
        }

        const safeSearch = searchInput.replace(/"/g, '\\"');

        // PING GEMINI FOR INTENT
        const geminiController = new AbortController();
        const geminiTimeout = setTimeout(() => geminiController.abort(), 15000);
        let geminiResponse;

        try {
            // UPGRADE: Removed the key from the URL string
            const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

            geminiResponse = await fetch(geminiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // UPGRADE: Securely passing the key via the official Google header
                    "x-goog-api-key": env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are the routing brain for PromoPro. The user searched for: "${safeSearch}". 
Analyze their intent and return a strict JSON object identifying the core brand or product category they want.
Return ONLY valid JSON format: {"matched_keyword": "brand_or_product_here"}.`
                        }]
                    }],
                    // UPGRADE: Force strict JSON output natively
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                }),
                signal: geminiController.signal
            });
        } finally {
            clearTimeout(geminiTimeout);
        }

        if (!geminiResponse.ok) {
            throw new Error(`Gemini request failed with status: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        const rawAiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        if (!rawAiText) throw new Error("Gemini routing failed to return text.");

        // UPGRADE: Regex cleaner removed as generationConfig guarantees strict JSON string
        let aiData = {};
        try {
            aiData = JSON.parse(rawAiText.trim());
        } catch {
            console.warn("Gemini returned invalid JSON. Falling back to original search input.");
        }

        const aiKeyword = (aiData.matched_keyword || searchInput).toLowerCase();

        // PING CJ AFFILIATE DIRECTLY
        const cjController = new AbortController();
        const cjTimeout = setTimeout(() => cjController.abort(), 15000);
        let cjResponse;

        try {
            const cjQuery = `
{
  shoppingProducts(companyId: "${env.CJ_COMPANY_ID}", keywords: ["${aiKeyword}"], limit: 1) {
    resultList {
      title
      description
      clickUrl
      imageUrl
    }
  }
}
`;

            cjResponse = await fetch("https://ads.cj.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${env.CJ_PERSONAL_TOKEN}`
                },
                body: JSON.stringify({ query: cjQuery }),
                signal: cjController.signal
            });
        } finally {
            clearTimeout(cjTimeout);
        }

        if (!cjResponse.ok) {
            throw new Error(`CJ Affiliate HTTP request failed with status: ${cjResponse.status}`);
        }

        const cjLive = await cjResponse.json();

        if (cjLive.errors) {
            throw new Error(cjLive.errors[0]?.message || "CJ GraphQL returned an error.");
        }

        // 3. AUDIT: Check that the CJ response has the expected shape
        if (!Array.isArray(cjLive?.data?.shoppingProducts?.resultList)) {
            throw new Error("Unexpected response structure from CJ Affiliate.");
        }

        const liveDeal = cjLive.data.shoppingProducts.resultList[0];

        // SEND THE DEAL BACK TO APP.JSX
        if (liveDeal) {
            const finalImage = liveDeal.imageUrl && liveDeal.imageUrl.startsWith("http")
                ? liveDeal.imageUrl
                : `https://placehold.co/400x400/png?text=${encodeURIComponent(aiKeyword)}`;

            const safeTitle = liveDeal.title || "Affiliate Deal";

            return new Response(JSON.stringify({
                success: true,
                keyword: aiKeyword,
                title: safeTitle.length > 35
                    ? safeTitle.substring(0, 35) + "..."
                    : safeTitle,
                description: liveDeal.description
                    ? (liveDeal.description.length > 100 ? liveDeal.description.substring(0, 100) + "..." : liveDeal.description)
                    : "Live automated deal verified by CJ Affiliate.",
                imageUrl: finalImage,
                clickUrl: liveDeal.clickUrl || "#",
                buttonText: "CLAIM DEAL"
            }), {
                status: 200, headers: corsHeaders
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: `Our automated engine couldn't find live promotions for "${aiKeyword}" right now.`
            }), {
                status: 200, headers: corsHeaders
            });
        }

    } catch (error) {
        // 4. AUDIT: Log useful information without exposing secrets
        console.error("Backend Error:", {
            search: searchInput,
            message: error.message
        });

        let errorMessage = error.message || "Backend verification failed.";
        if (error.name === 'AbortError') {
            errorMessage = "API connection timed out. Please try again.";
        }

        return new Response(JSON.stringify({
            success: false,
            message: errorMessage
        }), {
            status: 500, headers: corsHeaders
        });
    }
}
