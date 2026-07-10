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
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search: searchInput.trim() })
            });

            // Parse the JSON immediately so we can read the backend's error message
            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success) {
                setDynamicResult({
                    id: Date.now(),
                    store: data.title || "Affiliate Deal",
                    category: data.description || "Live affiliate deal found.",
                    img: data.imageUrl || "placeholder",
                    code: "AUTO-VERIFIED",
                    status: "LIVE",
                    btn: data.buttonText || "CLAIM DEAL",
                    theme: "blue",
                    url: data.clickUrl || "#"
                });
            } else {
                // If it fails, print the EXACT backend error directly to the orange card
                setDynamicResult({
                    id: response.status,
                    store: "SYSTEM DIAGNOSTIC",
                    category: data.message || `Server Error ${response.status}: No message provided.`,
                    img: "placeholder",
                    code: "ERROR LOG",
                    status: "FAILED",
                    btn: "REVIEW ERROR",
                    theme: "orange",
                    url: "#"
                });
            }
            setAiState("result");
        } catch (err) {
            console.error("Verify Error:", err);
            setDynamicResult({
                id: 500,
                store: "NETWORK CRASH",
                category: err.message || "Failed to fetch. Check your connection or route.",
                img: "placeholder",
                code: "OFFLINE",
                status: "ERROR",
                btn: "TRY AGAIN",
                theme: "orange",
                url: "#"
            });
            setAiState("result");
        }
    };

    return (
        <div className="app-shell" style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh', width: '100%' }}>
            
            <div className="sidebar" style={{ flex: '1 1 250px', height: 'fit-content', paddingBottom: '20px' }}>
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
                    <div className="career-box">Built by a self-taught full-stack developer transitioning from 20 years operating heavy machinery and leading infrastructure crews.</div>
                </div>
            </div>

            <div className="main-content" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
                
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
                            placeholder="What are you shopping for? (e.g. 'gaming laptop', 'lenovo')" 
                        />
                        <button className="cmd-btn" onClick={handleVerify}>AUTO-SEARCH</button>
                    </div>
                </div>

                <div className="grid">
                    <div className="matrix-card theme-blue">
                        <div className="card-header">TEST CARD</div>
                        <div className="card-info"><p>If you see this, render works. The issue is with the API data flow.</p></div>
                    </div>
                </div>

                {aiState === "searching" && (
                    <div className="matrix-scanner">
                        <div className="scanline"></div>
                        <div className="term-line">&gt; QUERYING SECURE BACKEND API...<span className="term-cursor"></span></div>
                        <div className="progress"><div className="progress-fill"></div></div>
                    </div>
                )}

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

                <article className="seo-content-block" style={{ marginTop: '40px', padding: '20px', color: '#cbd5e1' }}>
                    <h1><span style={{ color: '#38bdf8' }}>PromoPro: Your Premier AI-Powered Deal Aggregator</span></h1>
                    <p>Welcome to PromoPro by Purcell Tech, the definitive AI-driven verification engine for unparalleled savings. Our sophisticated system automatically tracks and verifies the most valuable promos across the digital marketplace, ensuring you receive immediate access to active deals for gaming, technology, and hardware. We deliver maximum value by intelligently routing users to verified offers.</p>

                    <h2 style={{ color: '#e2e8f0', marginTop: '20px' }}>Gaming Deals and Digital Keys</h2>
                    <p>Our platform specializes in sourcing the most competitive prices for video games and subscriptions. Whether you are searching for the latest titles or timeless classics, PromoPro is your gateway to significant savings. We provide a curated selection of offers to enhance your gaming library without overspending.</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '10px' }}><b><strong>Digital Game Keys:</strong></b> Secure instant access to a vast library of titles. When you want to buy cheap pc game keys online, our system finds the best available prices from trusted vendors.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>Xbox Game Pass:</strong></b> Find the latest discount xbox game pass ultimate code to unlock hundreds of high-quality games on console and PC.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>Minecraft:</strong></b> Get a great price on a cheap minecraft java bedrock key and start building your world today.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>Grand Theft Auto V:</strong></b> We locate deals for a gta v premium edition digital discount, providing access to the full story experience and Grand Theft Auto Online.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>PlayStation Network:</strong></b> Maximize your console's potential with discount playstation network gift cards, perfect for purchasing games, add-ons, and more.</li>
                    </ul>

                    <h2 style={{ color: '#e2e8f0', marginTop: '20px' }}>Unbeatable Tech and Hardware Promotions</h2>
                    <p>Beyond gaming, PromoPro extends its verification capabilities to the tech and hardware sectors. Our AI diligently scans for exclusive offers, ensuring you are equipped with the latest technology at the best possible price. We are committed to finding you superior deals on essential components and gadgets.</p>
                </article>

                <footer className="site-footer" style={{ marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
                    <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <div className="footer-section-title" style={{ color: '#94a3b8', fontWeight: 'bold' }}>⚠️ Affiliate Disclaimer</div>
                            <p style={{ color: '#64748b', fontSize: '12px' }}>PromoPro contains affiliate links. When you click a link and make a purchase or sign up, we may earn a commission at no extra cost to you. This helps keep the site running and free to use. We only feature products and services we believe provide value.</p>
                        </div>
                        <div>
                            <div className="footer-section-title" style={{ color: '#94a3b8', fontWeight: 'bold' }}>© Copyright</div>
                            <p style={{ color: '#64748b', fontSize: '12px' }}>© {new Date().getFullYear()} PromoPro. All rights reserved.<br/>Unauthorized reproduction or distribution of content, codes, or site structure is prohibited. All trademarks and logos belong to their respective owners.</p>
                        </div>
                    </div>
                </footer>
            </div>

            <aside className="promo-footer" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: '12px 0', background: 'rgba(0, 0, 0, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, boxShadow: '0 -5px 20px rgba(0,0,0,0.8)', borderTop: '1px solid #38bdf8' }}>
                <a href="https://www.gamivo.com/?glv=8kuvauuj" target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative' }}>
                    <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gamivo_logo.png/320px-Gamivo_logo.png" alt="GAMIVO 3% Off" style={{ maxHeight: '50px', width: 'auto', cursor: 'pointer' }} />
                </a>
            </aside>
            
        </div>
    );
};

export default App;

