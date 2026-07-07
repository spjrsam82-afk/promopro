import React, { useState } from "react";

const App = () => {
    const [searchInput, setSearchInput] = useState("");
    const [aiState, setAiState] = useState("idle"); 
    const [dynamicResult, setDynamicResult] = useState(null);

    const showToast = (message) => {
        console.log("System Toast:", message);
        alert(message);
    };

    const handleVerify = async () => {
        if (!searchInput.trim()) {
            showToast("Enter something to search.");
            return;
        }

        setAiState("searching");
        setDynamicResult(null);

        try {
            // Securely pinging your backend API instead of exposing keys in the browser
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    search: searchInput.trim()
                })
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            // UPGRADE: Debugging raw text response to catch hidden server errors
            const text = await response.text();
            console.log("Server response:", text);

            let liveDeal;
            try {
                liveDeal = JSON.parse(text);
            } catch (e) {
                throw new Error("API did not return valid JSON:\n" + text);
            }

            if (liveDeal.success) {
                setDynamicResult({
                    id: Date.now(),
                    store: liveDeal.title || "Affiliate Deal",
                    category: liveDeal.description || "Live affiliate deal found.",
                    img: liveDeal.imageUrl || "placeholder",
                    code: "AUTO-VERIFIED",
                    status: "LIVE",
                    btn: "CLAIM DEAL",
                    theme: "blue",
                    url: liveDeal.clickUrl || "#"
                });
            } else {
                setDynamicResult({
                    id: 404,
                    store: "NO ACTIVE DEALS FOUND",
                    category: liveDeal.message || `No affiliate deals were found for "${searchInput}".`,
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
            console.error(err);

            setDynamicResult({
                id: 500,
                store: "SERVER RESPONSE",
                category: err.message,
                img: "placeholder",
                code: "DEBUG",
                status: "ERROR",
                btn: "TRY AGAIN",
                theme: "orange",
                url: "#"
            });

            setAiState("result");
        }
    };

    return (
        <div className="app">
            
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
                        <span><span className="cmd-indicator"></span>API BACKEND NODE: SECURED</span>
                        <span>v.4.0.0 (SERVERLESS)</span>
                    </div>
                    <div className="cmd-input-wrapper">
                        <span className="cmd-prompt">&gt;</span>
                        <input 
                            type="text" 
                            className="cmd-input" 
                            value={searchInput} 
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()} 
                            placeholder="What are you shopping for? (e.g. 'gaming laptop', 'lenovo')" 
                        />
                        <button className="cmd-btn" onClick={handleVerify}>AUTO-SEARCH</button>
                    </div>
                </div>

                {/* Matrix Scanner Animation */}
                {aiState === "searching" && (
                    <div className="matrix-scanner">
                        <div className="scanline"></div>
                        <div className="term-line">&gt; QUERYING SECURE BACKEND API...<span className="term-cursor"></span></div>
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

