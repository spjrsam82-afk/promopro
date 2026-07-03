export async function onRequest(context) {
    // Handle the browser handshake (CORS)
    if (context.request.method === "OPTIONS") {
        return new Response(null, { 
            headers: { 
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, OPTIONS", 
                "Access-Control-Allow-Headers": "Content-Type" 
            } 
        });
    }

    try {
        const requestBody = await context.request.json();
        // Grab the search term, capitalize it for the matrix check, but keep the original for the dynamic search
        const rawSearch = requestBody.game ? requestBody.game.trim() : "";
        const gameSearch = rawSearch.toUpperCase();

        // ==========================================
        // THE PROMOPRO MASTER AFFILIATE MATRIX
        // For specific brands and custom deals
        // ==========================================
        const affiliateMatrix = {
            "GAMIVO": {
                network: "CJ Affiliate",
                link: "https://www.kqzyfj.com/click-101761790-15538971?url=https%3A%2F%2Fwww.gamivo.com%2F",
                message: "GAMIVO partner link verified. Shop securely here:"
            },
            "ELECTRONIC EXPRESS": {
                network: "CJ Affiliate",
                link: "https://www.anrdoezrs.net/click-101761790-16967290?url=https%3A%2F%2Fwww.electronicexpress.com%2F", 
                message: "Electronic Express partner link verified. Shop securely here:"
            },
            "REXING": {
                network: "CJ Affiliate",
                link: "https://www.anrdoezrs.net/click-101761790-17282356?url=https%3A%2F%2Frexing.com%2F",
                message: "Rexing Dash Cams partner link verified. Shop securely here:"
            },
            "GEARUP": {
                network: "CJ Affiliate",
                link: "https://www.tkqlhce.com/click-101761790-17290995?url=https%3A%2F%2Fwww.gearupbooster.com%2F",
                message: "GearUP Booster verified! Use custom code Promo_Pro_GearUP for 10% OFF at checkout. Secure link:"
            },
            "NORDVPN": {
                network: "CJ Affiliate",
                link: "https://www.anrdoezrs.net/click-101761790-14010115?url=https%3A%2F%2Fnordvpn.com%2F",
                message: "NordVPN protection link verified. Secure your connection here:"
            },
            "GAMEFLY": {
                network: "CJ Affiliate",
                link: "https://www.kqzyfj.com/click-101761790-10361644",
                message: "GameFly rental and purchase portal verified. Claim your deal here:"
            },
            "EXPEDIA": {
                network: "CJ Affiliate",
                link: "https://www.anrdoezrs.net/click-101761790-11552045?url=https%3A%2F%2Fwww.expedia.com%2F",
                message: "Expedia travel portal verified. Book your next trip securely here:"
            },
            "VRBO": {
                network: "CJ Affiliate",
                link: "https://www.anrdoezrs.net/click-101761790-11553823?url=https%3A%2F%2Fwww.vrbo.com%2F",
                message: "Vrbo vacation rentals link verified. Find your stay securely here:"
            },
            "HOTELS.COM": {
                network: "CJ Affiliate",
                link: "https://www.anrdoezrs.net/click-101761790-13828058?url=https%3A%2F%2Fwww.hotels.com%2F",
                message: "Hotels.com booking link verified. Find your ideal room securely here:"
            },
            "UNICE": {
                network: "CJ Affiliate",
                link: "https://www.jdoqocy.com/click-101761790-14566055?url=https%3A%2F%2Fwww.unice.com%2F",
                message: "UNice Hair partner link verified. Shop premium hair and wigs securely here:"
            }
        };

        const match = affiliateMatrix[gameSearch];

        if (match) {
            // If they typed a specific brand from your list above, send them there
            return Response.json({ 
                response: `AI Engine Verified [${match.network}]: ${match.message} ${match.link}` 
            });
        } else if (rawSearch.length > 0) {
            // ==========================================
            // THE AUTOMATIC GAMIVO GAME CATCHER
            // ==========================================
            // If it's not in the list, assume it's a game search.
            // This automatically builds a GAMIVO search link wrapped in your CJ tracker!
            
            const gamivoSearchUrl = `https://www.gamivo.com/search/${encodeURIComponent(rawSearch)}`;
            const dynamicTrackerLink = `https://www.kqzyfj.com/click-101761790-15538971?url=${encodeURIComponent(gamivoSearchUrl)}`;

            return Response.json({ 
                response: `AI Engine Verified [CJ Affiliate]: Hunting GAMIVO marketplace for '${rawSearch}'. Check for deals and keys securely here: ${dynamicTrackerLink}` 
            });
        } else {
            return Response.json({ 
                response: "Please enter a valid game or retailer to search." 
            });
        }

    } catch (error) {
        return Response.json({ response: "Backend error: " + error.message }, { status: 500 });
    }
}
