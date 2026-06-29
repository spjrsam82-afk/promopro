const { useState, useEffect, useMemo } = React;
// AI Optimization: Force Next-Gen WebP format and compress width to save massive bandwidth
const PROXY_URL = "https://wsrv.nl/?output=webp&w=500&url=";

const SafeImage = function({ src, alt, className }) {
    const [attempts, setAttempts] = useState(0);
    if (!src || attempts >= 2) {
        return React.createElement("div", { className: "fallback-bg" }, `🎮 ${alt}`);
    }
    const isAbsolute = src.startsWith('http');
    const proxiedSrc = (attempts === 1 && isAbsolute) ? PROXY_URL + encodeURIComponent(src) : src;
    return React.createElement("img", {
        src: proxiedSrc,
        alt: alt,
        className: className,
        loading: "lazy",
        onError: () => setAttempts(a => a + 1)
    });
};

const TacticalTerminalBar = function({ title, children, defaultOpen = false, themeColor = "#10b981" }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    if (!children || (Array.isArray(children) && children.length === 0)) return null;

    return React.createElement("section", { className: "tactical-accordion", style: { borderLeft: `3px solid ${themeColor}` } },
        React.createElement("button", {
            onClick: () => setIsOpen(!isOpen),
            className: "tactical-accordion-header",
            "aria-expanded": isOpen,
            style: { color: isOpen ? themeColor : '#d4d4d8' }
        },
            React.createElement("span", null, title),
            React.createElement("span", { className: "tactical-toggle" }, isOpen ? '[-] CLOSE' : '[+] EXPAND')
        ),
        isOpen && React.createElement("div", { className: "tactical-accordion-body" },
            React.createElement("div", { className: "grid" }, children)
        )
    );
};

const MatrixScanner = function() {
    const [lines, setLines] = useState([]);
    useEffect(() => {
        const sequence = [
            "> Connecting to PromoPro AI...",
            "> Understanding your request...",
            "> Searching affiliate partners...",
            "> Comparing verified offers...",
            "> Checking live promotions...",
            "> Ranking best results...",
            "> Building AI response...",
            "> Complete."
        ];
        let step = 0;
        const interval = setInterval(() => {
            if (step < sequence.length) {
                setLines(prev => [...prev, sequence[step]]);
                step++;
            } else {
                clearInterval(interval);
            }
        }, 300); 
        return () => clearInterval(interval);
    }, []);

    return React.createElement("div", { className: "matrix-scanner", "aria-live": "polite" },
        React.createElement("div", { className: "scanline" }),
        React.createElement("div", { className: "progress" }, React.createElement("div", { className: "progress-fill" })),
        lines.map((line, idx) => React.createElement("div", { key: idx, className: "term-line" }, line)),
        React.createElement("div", { className: "term-line" }, ">", React.createElement("span", { className: "term-cursor" }))
    );
};

export default function App() {
    const [allEntries, setAllEntries]       = useState([]);
    const [searchInput, setSearchInput]     = useState("");
    const [aiState, setAiState]             = useState("idle");
    const [dynamicResult, setDynamicResult] = useState(null);
    const [revealedCodes, setRevealedCodes] = useState({});
    const [toast, setToast]                 = useState(null); 
    const [activeTab, setActiveTab]         = useState("ALL");
    
    const [dismissedCards, setDismissedCards] = useState(() => {
        const saved = localStorage.getItem('promo_dismissed');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        fetch('/data.json')
            .then(response => {
                if (!response.ok) throw new Error("Failed to load JSON data.");
                return response.json();
            })
            .then(data => setAllEntries(data))
            .catch(error => {
                console.error("Error loading ledger data:", error);
                showToast(`ERROR: FAILED TO MOUNT DATA.JSON`);
            });
    }, []);

    useEffect(() => {
        localStorage.setItem('promo_dismissed', JSON.stringify(dismissedCards));
    }, [dismissedCards]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.querySelector('.cmd-input').focus();
            } else if (e.key === 'Escape') {
                setSearchInput('');
                document.querySelector('.cmd-input').blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => { setToast(null); }, 3000);
    };

    const API_URL = "/api/gemini"; 

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

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: searchInput })
            });

            const data = await response.json();
            if (data.error) { throw new Error(data.error); }

            setDynamicResult({
                id: 999,
                store: searchInput.toUpperCase(),
                category: "PromoPro AI Search",
                img: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
                code: data.text, 
                status: "ONLINE",
                btn: "AI RESPONSE",
                theme: "blue",
                url: "#",
                fit: "contain"
            });
            setAiState("result");
        } catch (err) {
            console.error("PromoPro API Error:", err);
            setDynamicResult({
                id: 999,
                store: "Error",
                category: err.message || "Failed to execute query.",
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

    const handleAction = (e, id, codeText, url, storeName) => {
        e.preventDefault();
        setRevealedCodes(prev => ({ ...prev, [id]: true }));
        const hasLink = url && url !== "#";
        const hasCode = codeText && !["AUTO-ROUTED","NONE","WEBSHOP","PUBLIC"].includes(codeText);

        if (typeof window.gtag === 'function') {
            window.gtag('event', 'affiliate_click', { store: storeName, destination_url: url });
        }

        if (hasCode) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(codeText);
                showToast(`SYSTEM LOG: CODE '${codeText}' COPIED.`);
            } else {
                console.log(`Fallback: Code is ${codeText}`);
            }
        }
        if (hasLink) { window.open(url, "_blank", "noopener,noreferrer"); }
    };

    const handleDismiss = (e, id) => {
        e.stopPropagation();
        setDismissedCards(prev => [...prev, id]);
    };

    const renderCode = (id, code) => {
        if (["AUTO-ROUTED","NONE","PUBLIC","WEBSHOP"].includes(code)) {
            return React.createElement("span", { className: "highlight" }, `'${code}'`);
        }
        return revealedCodes[id] ? 
            React.createElement("span", { className: "highlight" }, `'${code}'`) : 
            React.createElement("span", { className: "hidden-code" }, "'********'");
    };

    const createPromoCard = (p) => {
        return React.createElement("article", { className: `matrix-card theme-${p.theme}`, key: p.id, onClick: (e) => handleAction(e, p.id, p.code, p.url, p.store) },
            React.createElement("button", { className: "dismiss-btn", "aria-label": `Dismiss ${p.store}`, onClick: (e) => handleDismiss(e, p.id), title: "Dismiss Card" }, "X"),
            React.createElement("div", { className: "card-header" }, p.store, " ", React.createElement("span", null, `// ${p.category}`)),
            React.createElement(SafeImage, { src: p.img, alt: p.store, className: p.fit === "contain" ? "card-banner-contain" : "card-banner" }),
            React.createElement("div", { className: "card-footer" },
                React.createElement("div", { className: "card-info" },
                    React.createElement("div", null, "code: ", renderCode(p.id, p.code)),
                    React.createElement("div", null, "status: ", React.createElement("span", { className: "highlight" }, `'${p.status}'`))
                ),
                React.createElement("button", { className: `status-btn${p.theme === "blue" ? " blue-btn" : ""}` }, p.btn)
            )
        );
    };

    const { displayedCards, grouped } = useMemo(() => {
        let filtered = allEntries.filter(card => !dismissedCards.includes(card.id));
        const groups = filtered.reduce((acc, item) => {
            (acc[item.group] = acc[item.group] || []).push(item);
            return acc;
        }, {});

        if (activeTab === 'GAMING') {
            filtered = filtered.filter(c => c.category.includes('Gaming') || c.category.includes('Game') || c.category.includes('GAMIVO') || c.category.includes('Key'));
        } else if (activeTab === 'TECH') {
            filtered = filtered.filter(c => c.category.includes('Tech') || c.category.includes('Developer') || c.category.includes('Technical') || c.category.includes('Lifeline') || c.category.includes('Hardware'));
        } else if (activeTab === 'LIFESTYLE') {
            filtered = filtered.filter(c => c.category.includes('Travel') || c.category.includes('Beauty') || c.category.includes('Exclusive'));
        }
        return { displayedCards: filtered, grouped: groups };
    }, [allEntries, dismissedCards, activeTab]);

    const activeAirTalk = grouped['AIRTALK'] || [];
    const activeEExpress = grouped['EEXPRESS'] || [];
    const activeGamivo = grouped['GAMIVO'] || [];
    const activeHero = grouped['HERO'] || [];
    const activeCore = grouped['CORE'] || [];

    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "overlay-tint" }),
        // SEMANTIC HTML: <aside> instead of <div>
        React.createElement("aside", { className: "sidebar" },
            React.createElement("div", { className: "sidebar-logo" }, React.createElement("div", { className: "logo-icon" }, "P"), React.createElement("span", null, "Promo"), React.createElement("span", { style: { color: '#f97316' } }, "Pro")),
            React.createElement("div", { className: "nav-matrix-title" }, "NAV-MATRIX"),
            // SEMANTIC HTML: <nav> instead of <div>
            React.createElement("nav", { className: "nav-menu" },
                React.createElement("div", { className: `nav-item ${activeTab === 'ALL' ? 'active' : ''}`, onClick: () => { setActiveTab('ALL'); setAiState("idle"); } }, "🌐 ALL NODES"),
                React.createElement("div", { className: `nav-item ${activeTab === 'GAMING' ? 'active' : ''}`, onClick: () => { setActiveTab('GAMING'); setAiState("idle"); } }, "🎮 GAMING and KEYS"),
                React.createElement("div", { className: `nav-item ${activeTab === 'TECH' ? 'active' : ''}`, onClick: () => { setActiveTab('TECH'); setAiState("idle"); } }, "💻 TECH and TOOLS"),
                React.createElement("div", { className: `nav-item ${activeTab === 'LIFESTYLE' ? 'active' : ''}`, onClick: () => { setActiveTab('LIFESTYLE'); setAiState("idle"); } }, "✈️ LIFESTYLE")
            ),
            React.createElement("div", { className: "career-context" },
                React.createElement("div", { className: "career-title" }, "SYSTEM STATUS"),
                React.createElement("div", { className: "career-icons" }, React.createElement("span", null, "🛡️"), React.createElement("span", null, "⚡"), React.createElement("span", { className: "cs50-icon" }, "SECURE")),
                React.createElement("div", { className: "career-box" }, React.createElement("strong", null, "SYSTEM ADMIN:"), React.createElement("br", null), "Access Level: Tier 1", React.createElement("br", null), "Engine Status: Online and Routing")
            )
        ),
        // SEMANTIC HTML: <main> instead of <div>
        React.createElement("main", { className: "main-content" },
            React.createElement("section", { className: "command-center" },
                React.createElement("div", { className: "cmd-status" },
                    React.createElement("div", null, React.createElement("span", { className: "cmd-indicator" }), "PROMOPRO AI SEARCH ENGINE // ONLINE"),
                    React.createElement("span", { style: { color: '#64748b' } }, "V2.6.SECURE")
                ),
                React.createElement("form", { onSubmit: (e) => { e.preventDefault(); handleVerify(); }, className: "cmd-input-wrapper", role: "search" },
                    React.createElement("span", { className: "cmd-prompt" }, "$>"),
                    React.createElement("input", { type: "text", "aria-label": "Search Promos", value: searchInput, onChange: (e) => setSearchInput(e.target.value), placeholder: "Search for brands, games, or promo codes... (Press '/' to focus)", className: "cmd-input" }),
                    React.createElement("button", { type: "submit", className: "cmd-btn" }, "Execute Query")
                )
            ),
            aiState === "idle" && React.createElement("header", { className: "promo-hero-banner", style: { backgroundImage: `url('https://raw.githubusercontent.com/spjrsam82-afk/promopro/main/promopro-banner-final~2.jpg')` } },
                React.createElement("h1", { className: "hero-title" }, "PromoPro")
            ),
            aiState === "searching" && React.createElement(MatrixScanner, null),
            aiState === "result" && dynamicResult && React.createElement(React.Fragment, null,
                React.createElement("div", { className: "section-label", style: { color: '#4ade80', borderBottomColor: '#4ade80' } }, "✅ MATCH CONFIRMED"),
                React.createElement("div", { className: "grid" }, createPromoCard(dynamicResult)),
                React.createElement("button", { className: "status-btn blue-btn", style: { marginTop: '20px', padding: '12px 24px', width: 'fit-content', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }, onClick: () => { setAiState("idle"); setSearchInput(""); } }, "< RETURN TO MAIN MATRIX")
            ),
            aiState === "idle" && (
                activeTab === 'ALL' ? React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { width: '100%', maxWidth: '1400px', margin: '0 auto 40px auto' } },
                        React.createElement(TacticalTerminalBar, { title: "AIRTALK LIFELINE NETWORK & PROMOS", themeColor: "#38bdf8" }, activeAirTalk.map(createPromoCard)),
                        React.createElement(TacticalTerminalBar, { title: "ELECTRONIC EXPRESS // DISCOUNT PC HARDWARE COMPONENTS ONLINE", themeColor: "#38bdf8" }, activeEExpress.map(createPromoCard)),
                        React.createElement(TacticalTerminalBar, { title: "GAMIVO DIGITAL GAMING // BUY CHEAP PC GAME KEYS ONLINE", themeColor: "#f97316" }, activeGamivo.map(createPromoCard))
                    ),
                    React.createElement("h2", { className: "section-label" }, "🏆 Hero Products — Top Picks"),
                    React.createElement("div", { className: "grid" }, activeHero.map(createPromoCard)),
                    React.createElement("h2", { className: "section-label" }, "⚡ Core Affiliate Ledger"),
                    React.createElement("div", { className: "grid" }, activeCore.map(createPromoCard))
                ) : React.createElement(React.Fragment, null,
                    React.createElement("h2", { className: "section-label" }, `⚡ FILTERED RESULTS: ${activeTab}`),
                    React.createElement("div", { className: "grid" }, displayedCards.map(createPromoCard))
                )
            ),
            toast && React.createElement("div", { className: "cyber-toast", role: "status" }, React.createElement("span", null, "✅"), toast)
        )
    );
}
