const { useState } = React;

const App = () => {
    const [searchInput, setSearchInput] = useState("");
    const [aiState, setAiState] = useState("idle"); 
    const [dynamicResult, setDynamicResult] = useState(null);
    const [dismissedCards, setDismissedCards] = useState([]);

    const allEntries = [
        { id: 1, store: "GAMIVO", category: "Global Gaming Marketplace", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gamivo_logo.png/320px-Gamivo_logo.png", code: "PROMO-ACTIVE", status: "ONLINE", btn: "CLAIM", theme: "orange", url: "#" }
    ];

    const showToast = (message) => {
        console.log("System Toast:", message);
        alert(message);
    };

    const handleVerify = async () => {
        if (!searchInput.trim()) return;

        const searchLower = searchInput.toLowerCase();
        const localMatch = allEntries.find(item => 
            item.store.toLowerCase().includes(searchLower) || 
            item.category.toLowerCase().includes(searchLower)
        );

        if (localMatch && !dismissedCards.includes(localMatch.id)) {
            setDynamicResult(localMatch);
            setAiState("result");
            showToast(`LOCAL MATCH FOUND: SECURE NODE ROUTED.`);
            return; 
        }

        setAiState("searching");
        setDynamicResult(null);
        await new Promise(resolve => setTimeout(resolve, 2500));

        const API_URL = "YOUR_GEMINI_API_KEY_URL_HERE";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are PromoPro AI. The user searched for: "${searchInput}". Return ONLY valid JSON: {"title":"","description":"","image_search":""}. Rules: title=brand/product, description=short affiliate response, image_search=best search phrase. Do not include markdown. Only return JSON.`
                        }]
                    }]
                })
            });

            const data = await response.json();
            let rawAiText = data.candidates[0].content.parts[0].text;
            rawAiText = rawAiText.replace(/```json|```/g, '').trim();
            const aiData = JSON.parse(rawAiText);

            setDynamicResult({
                id: 999,
                store: aiData.title,
                category: aiData.description,
                img: `https://wsrv.nl/?url=https://source.unsplash.com/random/400x400/?${encodeURIComponent(aiData.image_search)}`,
                code: "AI-VERIFIED",
                status: "ONLINE",
                btn: "CLAIM DEAL",
                theme: "blue",
                url: "#",
                fit: "cover"
            });
            setAiState("result");

        } catch (err) {
            console.error("PromoPro AI Parsing Error:", err);
            setDynamicResult({
                id: 999,
                store: "Error",
                category: "Failed to parse AI structure.",
                img: "",
                code: "FAILED",
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
            
            {/* Sidebar matches your .sidebar CSS */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">P</div>
                    PromoPro
                </div>
                <div className="nav-matrix-title">SYSTEM LEDGER</div>
                <div className="nav-item active">Dashboard</div>
                <div className="nav-item">Gaming Deals</div>
                <div className="nav-item">Tech Hardware</div>
                
                <div className="career-context">
                    <div className="career-title">Creator Profile</div>
                    <div className="career-box">Built by a self-taught full-stack developer transitioning from 23 years in infrastructure.</div>
                </div>
            </div>

            {/* Main Content matches your .main-content CSS */}
            <div className="main-content">
                
                <div className="promo-hero-banner">
                    <h1 className="hero-title">PROMO MATRIX</h1>
                </div>

                <div className="command-center">
                    <div className="cmd-status">
                        <span><span className="cmd-indicator"></span>AI SEARCH NODE: ONLINE</span>
                        <span>v.2.0.4</span>
                    </div>
                    <div className="cmd-input-wrapper">
                        <span className="cmd-prompt">&gt;</span>
                        <input 
                            type="text" 
                            className="cmd-input" 
                            value={searchInput} 
                            onChange={(e) => setSearchInput(e.target.value)} 
                            placeholder="Initialize query (e.g. 'Xbox', 'Minecraft', 'Gamivo')" 
                        />
                        <button className="cmd-btn" onClick={handleVerify}>VERIFY</button>
                    </div>
                </div>

                {/* Matrix Scanner Animation */}
                {aiState === "searching" && (
                    <div className="matrix-scanner">
                        <div className="scanline"></div>
                        <div className="term-line">&gt; INITIALIZING AI SEARCH PROTOCOL...<span className="term-cursor"></span></div>
                        <div className="progress"><div className="progress-fill"></div></div>
                    </div>
                )}

                {/* Results Grid */}
                {aiState === "result" && dynamicResult && (
                    <div className="grid">
                        <div className={`matrix-card theme-${dynamicResult.theme}`}>
                            <div className="card-header">{dynamicResult.store}</div>
                            {dynamicResult.img ? (
                                <img src={dynamicResult.img} className={dynamicResult.fit === 'cover' ? 'card-banner' : 'card-banner-contain'} alt={dynamicResult.store} />
                            ) : (
                                <div className="fallback-bg">NO IMAGE FOUND</div>
                            )}
                            <div className="card-info">
                                <p>{dynamicResult.category}</p>
                            </div>
                            <div className="card-footer">
                                <span className="hidden-code">{dynamicResult.code}</span>
                                <button className={`status-btn ${dynamicResult.theme === 'blue' ? 'blue-btn' : ''}`}>{dynamicResult.status}</button>
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
