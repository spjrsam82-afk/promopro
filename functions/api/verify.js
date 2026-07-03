export async function onRequestPost(context) {
    // This grabs the incoming request and your hidden Cloudflare Environment Variables
    const { request, env } = context;

    try {
        const body = await request.json();
        const searchInput = body.search;

        if (!searchInput) {
            return new Response(JSON.stringify({ success: false, message: "No search term provided." }), { 
                status: 400, headers: { "Content-Type": "application/json" } 
            });
        }

        // 1. PING GEMINI FOR INTENT
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the routing brain for PromoPro. The user searched for: "${searchInput}". 
                        Analyze their intent and return a strict JSON object identifying the core brand or product category they want.
                        Return ONLY valid JSON format: {"matched_keyword": "brand_or_product_here"}. 
                        Do not include markdown backticks.`
                    }]
                }]
            })
        });

        const geminiData = await geminiResponse.json();
        const rawAiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        
        if (!rawAiText) throw new Error("Gemini routing failed.");
        
        const cleaned = rawAiText.replace(/```json|```/g, "").trim();
        const aiData = JSON.parse(cleaned);
        const aiKeyword = aiData.matched_keyword.toLowerCase();

        // 2. PING CJ AFFILIATE DIRECTLY 
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

        const cjResponse = await fetch("https://ads.cj.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.CJ_PERSONAL_TOKEN}`
            },
            body: JSON.stringify({ query: cjQuery })
        });

        const cjLive = await cjResponse.json();
        const liveDeal = cjLive?.data?.shoppingProducts?.resultList?.[0];

        // 3. SEND THE DEAL BACK TO APP.JS
        if (liveDeal) {
            return new Response(JSON.stringify({
                success: true,
                title: liveDeal.title.substring(0, 35) + "...",
                description: liveDeal.description ? liveDeal.description.substring(0, 100) + "..." : "Live automated deal verified by CJ Affiliate.",
                imageUrl: liveDeal.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(aiKeyword)}/400/400`,
                clickUrl: liveDeal.clickUrl
            }), { 
                status: 200, headers: { "Content-Type": "application/json" } 
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                message: `Our automated engine couldn't find live promotions for "${aiKeyword}" right now.`
            }), { 
                status: 200, headers: { "Content-Type": "application/json" } 
            });
        }

    } catch (error) {
        console.error("Backend Error:", error);
        return new Response(JSON.stringify({ success: false, message: "Backend verification failed." }), { 
            status: 500, headers: { "Content-Type": "application/json" } 
        });
    }
}
