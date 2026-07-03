const { useState } = React;

const App = () => {
    const [searchInput, setSearchInput] = useState("");
    const [aiState, setAiState] = useState("idle"); 
    const [dynamicResult, setDynamicResult] = useState(null);

    const showToast = (message) => {
        console.log("System Toast:", message);
        alert(message);
    };

    const handleVerify = async () => {
        if (!searchInput.trim()) return;

        setAiState("searching");
        setDynamicResult(null);
        await new Promise(resolve => setTimeout(resolve, 2500));

        // GEMINI API (The Brain)
        const API_URL = "

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are the routing brain for PromoPro. The user searched for: "${searchInput}". 
                            Analyze their intent and return a strict JSON object identifying the core brand or product category they want.
                            Return ONLY valid JSON format: {"matched_keyword": "brand_or_product_here"}. 
                            Example: If they search "I need a cheap Lenovo rig", return {"matched_keyword": "lenovo"}.
                            Do not include markdown backticks.`
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            const rawAiText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

            if (!rawAiText) {
                throw new Error("Gemini returned no text.");
            }

            const cleaned = rawAiText.replace(/```json|```/g, "").trim();
            const aiData = JSON.parse(cleaned);

            // 1. Take the clean keyword Gemini extracted
            const aiKeyword = aiData.matched_keyword.toLowerCase();

            // 2. LIVE CJ AFFILIATE API AUTOMATION
            // Paste your actual CJ credentials right here:
            const CJ_PERSONAL_TOKEN = "2WPMCDUtkwWRKAiQMtBPcQMviQ"; 
            const CJ_COMPANY_ID = "7968880";

            // This is the strict GraphQL query CJ requires to search their live products
            const cjQuery = `
            {
              shoppingProducts(companyId: "${7968880}", keywords: ["${aiKeyword}"], limit: 1) {
                resultList {
                  title
                  description
                  clickUrl
                  imageUrl
                }
              }
            }
            `;

            // 3. Ping CJ's live database (Using a CORS proxy so it works inside Codespaces testing)
            const cjResponse = await fetch("https://corsproxy.io/?https://ads.cj.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${eyJhbGciOiJIUzI1NiIXVCJ9}`
                },
                body: JSON.stringify({ query: cjQuery })
            });

            const cjLive = await cjResponse.json();
            const liveDeal = cjLive?.data?.shoppingProducts?.resultList?.[0];

            if (liveDeal) {
                // 4. If CJ finds a live product, automatically build the card
                setDynamicResult({
                    id: 999,
                    store: liveDeal.title.substring(0, 35) + "...", // Keeps long titles from breaking your UI
                    category: liveDeal.description ? liveDeal.description.substring(0, 100) + "..." : "Live automated deal verified by CJ Affiliate.",
                    img: liveDeal.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(aiKeyword)}/400/400`,
                    code: "AUTO-VERIFIED",
                    status: "LIVE",
                    btn: "CLAIM DEAL",
                    theme: "blue",
                    url: liveDeal.clickUrl // Your actual, monetized CJ tracking link
                });
            } else {
                // 5. Fallback if CJ's live database has zero products for that exact search
                setDynamicResult({
                    id: 404,
                    store: "NO ACTIVE DEALS FOUND",
                    category: `Our automated engine couldn't find live promotions for "${aiKeyword}" right now. We are actively monitoring networks for new discounts.`,
                    img: "placeholder",
                    code: "AUTO-MONITORING",
                    status: "STANDBY",
                    btn: "CHECK BACK LATER",
                    theme: "orange",
                    url: "#"
                });
            }
            setAiState("result");

        } catch (err) {
            console.error("PromoPro AI Parsing Error:", err);
            setDynamicResult({
                id: 999,
                store: "CONNECTION ERROR",
                category: "The automated search engine encountered a delay. Please try your search again.",
                img: "",
                code: "RETRY-SEARCH",
                status: "ERROR",
                btn: "TRY AGAIN",
                theme: "orange",
                url: "#"
            });
            setAiState("result");
        }
    };

    return (
        <div id="root">
            
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">P</div>
                    PromoPro
                </div>
                <div className="nav-matrix-title">AUTOMATED ENGINE</div>
                <div className="nav-item active">Live Dashboard</div>
                <div className="nav-item">Gaming Deals</div>
                <div className="nav-item">Tech Hardware</div>
                
                <div className="career-context">
                    <div className="career-title">Creator Profile</div>
                    <div className="career-box">Built by a self-taught full-stack developer transitioning from 23 years in infrastructure.</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                
                <div className="promo-hero-banner">
                    <h1 className="hero-title">AUTOMATED SAVINGS</h1>
                </div>

                <div className="command-center">
                    <div className="cmd-status">
                        <span><span className="cmd-indicator"></span>AI VERIFICATION ENGINE: ONLINE</span>
                        <span>v.3.0.0 (CJ-LIVE)</span>
                    </div>
                    <div className="cmd-input-wrapper">
                        <span className="cmd-prompt">&gt;</span>
                        <input 
                            type="text" 
                            className="cmd-input" 
                            value={searchInput} 
                            onChange={(e) => setSearchInput(e.target.value)} 
                            placeholder="What are you shopping for? (e.g. 'gaming laptop', 'lenovo')" 
                        />
                        <button className="cmd-btn" onClick={handleVerify}>AUTO-SEARCH</button>
                    </div>
                </div>

                {/* Matrix Scanner Animation */}
                {aiState === "searching" && (
                    <div className="matrix-scanner">
                        <div className="scanline"></div>
                        <div className="term-line">&gt; AUTOMATICALLY SCANNING AFFILIATE NETWORKS...<span className="term-cursor"></span></div>
                        <div className="progress"><div className="progress-fill"></div></div>
                    </div>
                )}

                {/* Results Grid */}
                {aiState === "result" && dynamicResult && (
                    <div className="grid">
                        <div className={`matrix-card theme-${dynamicResult.theme}`}>
                            <div className="card-header">{dynamicResult.store}</div>
                            {dynamicResult.img !== "placeholder" ? (
                                <img src={dynamicResult.img} className={dynamicResult.fit === 'cover' ? 'card-banner' : 'card-banner-contain'} alt={dynamicResult.store} />
                            ) : (
                                <div className="fallback-bg">SEARCH LOGGED</div>
                            )}
                            <div className="card-info">
                                <p>{dynamicResult.category}</p>
                            </div>
                            <div className="card-footer">
                                <span className="hidden-code">{dynamicResult.code}</span>
                                <a href={dynamicResult.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <button className={`status-btn ${dynamicResult.theme === 'blue' ? 'blue-btn' : ''}`}>
                                        {dynamicResult.btn || "CLAIM DEAL"}
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
            <div className="overlay-tint"></div>
        </div>
    );
};

export default App;
