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

            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            const liveDeal = await response.json();

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
            console.error("Verify Error:", err);
            setDynamicResult({
                id: 500,
                store: "CONNECTION ERROR",
                category: "Unable to reach the PromoPro verification server.",
                img: "placeholder",
                code: "SERVER ERROR",
                status: "ERROR",
                btn: "TRY AGAIN",
                theme: "orange",
                url: "#"
            });
            setAiState("result");
        }
    };

    return (
        /* Replaced #root with .app-shell and added inline flex to keep layout intact */
        <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            
            {/* Sidebar (Stays pinned to the left) */}
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

            {/* Main Content (Takes up remaining space) */}
            <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
                
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

                {/* SEO Content Block (Moved below interactive elements for better UX) */}
                <article className="seo-content-block" style={{ marginTop: '40px', padding: '20px', color: '#cbd5e1' }}>
                    <h1><span style={{ color: '#38bdf8' }}>PromoPro: Your Premier AI-Powered Deal Aggregator</span></h1>
                    <p>Welcome to PromoPro by Purcell Tech, the definitive AI-driven verification engine for unparalleled savings. Our sophisticated system automatically tracks and verifies the most valuable <b><strong>promos</strong></b> across the digital marketplace, ensuring you receive immediate access to active deals for gaming, technology, and hardware. We deliver maximum value by intelligently routing users to verified offers.</p>

                    <h2 style={{ color: '#e2e8f0', marginTop: '20px' }}>Gaming Deals and Digital Keys</h2>
                    <p>Our platform specializes in sourcing the most competitive prices for video games and subscriptions. Whether you are searching for the latest titles or timeless classics, PromoPro is your gateway to significant savings. We provide a curated selection of offers to enhance your gaming library without overspending.</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '10px' }}><b><strong>Digital Game Keys:</strong></b> Secure instant access to a vast library of titles. When you want to <b><strong>buy cheap pc game keys online</strong></b>, our system finds the best available prices from trusted vendors.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>Xbox Game Pass:</strong></b> Find the latest <b><strong>discount xbox game pass ultimate code</strong></b> to unlock hundreds of high-quality games on console and PC.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>Minecraft:</strong></b> Get a great price on a <b><strong>cheap minecraft java bedrock key</strong></b> and start building your world today.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>Grand Theft Auto V:</strong></b> We locate deals for a <b><strong>gta v premium edition digital discount</strong></b>, providing access to the full story experience and Grand Theft Auto Online.</li>
                        <li style={{ marginBottom: '10px' }}><b><strong>PlayStation Network:</strong></b> Maximize your console's potential with <b><strong>discount playstation network gift cards</strong></b>, perfect for purchasing games, add-ons, and more.</li>
                    </ul>

                    <h2 style={{ color: '#e2e8f0', marginTop: '20px' }}>Unbeatable Tech and Hardware Promotions</h2>
                    <p>Beyond gaming, PromoPro extends its verification capabilities to the tech and hardware sectors. Our AI diligently scans for exclusive offers, ensuring you are equipped with the latest technology at the best possible price. We are committed to finding you superior deals on essential components and gadgets.</p>
                </article>

                {/* Footer Section */}
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

            {/* Floating Promo Footer Banner */}
            <aside className="promo-footer" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: '12px 0', background: 'rgba(0, 0, 0, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, boxShadow: '0 -5px 20px rgba(0,0,0,0.8)', borderTop: '1px solid #38bdf8' }}>
                <a href="https://www.gamivo.com/?glv=8kuvauuj" target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative' }}>
                    <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gamivo_logo.png/320px-Gamivo_logo.png" alt="GAMIVO 3% Off" style={{ maxHeight: '50px', width: 'auto', cursor: 'pointer' }} />
                </a>
            </aside>
            
        </div>
    );
};

export default App;
