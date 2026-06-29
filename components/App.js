const { useState, useEffect, useMemo } = React;

import Sidebar from './Sidebar.js';
import SearchBar from './SearchBar.js';
import MatrixScanner from './MatrixScanner.js';
import PromoCard from './PromoCard.js';
import Accordion from './Accordion.js';

export default function App() {
    // 1. STATE MANAGEMENT
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

    // 2. FETCH DATA ON LOAD
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

    // 3. PERSIST DISMISSED CARDS
    useEffect(() => {
        localStorage.setItem('promo_dismissed', JSON.stringify(dismissedCards));
    }, [dismissedCards]);

    // 4. KEYBOARD SHORTCUTS
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.querySelector('.cmd-input').focus();
            } 
            else if (e.key === 'Escape') {
                setSearchInput('');
                document.querySelector('.cmd-input').blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 5. TOAST NOTIFICATION HELPER
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => { setToast(null); }, 3000);
    };

    const API_URL = "/api/gemini"; 

    // 6. MAIN VERIFICATION / SEARCH LOGIC
    const handleVerify = async () => {
        if (!searchInput.trim()) return;

        // INSTANT LOCAL SEARCH CHECK
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

        // THEATRICAL DELAY FOR MATRIX SCANNER
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

    // 7. CARD CLICK ACTIONS
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
        
        // SECURE WINDOW OPEN
        if (hasLink) { window.open(url, "_blank", "noopener,noreferrer"); }
    };

    const handleDismiss = (e, id) => {
        e.stopPropagation();
        setDismissedCards(prev => [...prev, id]);
    };

    const createPromoCard = (p) => React.createElement(PromoCard, {
        key: p.id, p, handleAction, handleDismiss, revealedCodes
    });

    // 8. PERFORMANCE OPTIMIZATION - MEMOIZED GROUPING & FILTERING
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

    // 9. MAIN RENDER
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "overlay-tint" }),
        React.createElement(Sidebar, { activeTab, setActiveTab, setAiState }),
        React.createElement("div", { className: "main-content" },
            React.createElement(SearchBar, { searchInput, setSearchInput, handleVerify }),
            
            aiState === "idle" && React.createElement("div", {
                className: "promo-hero-banner",
                style: { backgroundImage: `url('https://raw.githubusercontent.com/spjrsam82-afk/promopro/main/promopro-banner-final~2.jpg')` }
            },
                React.createElement("h1", { className: "hero-title" }, "PromoPro")
            ),
            
            aiState === "searching" && React.createElement(MatrixScanner, null),
            
            aiState === "result" && dynamicResult && React.createElement(React.Fragment, null,
                React.createElement("div", { className: "section-label", style: { color: '#4ade80', borderBottomColor: '#4ade80' } }, "✅ MATCH CONFIRMED"),
                React.createElement("div", { className: "grid" }, createPromoCard(dynamicResult)),
                React.createElement("button", {
                    className: "status-btn blue-btn",
                    style: { marginTop: '20px', padding: '12px 24px', width: 'fit-content', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
                    onClick: () => { setAiState("idle"); setSearchInput(""); }
                }, "< RETURN TO MAIN MATRIX")
            ),
            
            aiState === "idle" && (
                activeTab === 'ALL' ? React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { width: '100%', maxWidth: '1400px', margin: '0 auto 40px auto' } },
                        React.createElement(Accordion, { title: "AIRTALK LIFELINE NETWORK & PROMOS", themeColor: "#38bdf8" }, activeAirTalk.map(createPromoCard)),
                        React.createElement(Accordion, { title: "ELECTRONIC EXPRESS // DISCOUNT PC HARDWARE COMPONENTS ONLINE", themeColor: "#38bdf8" }, activeEExpress.map(createPromoCard)),
                        React.createElement(Accordion, { title: "GAMIVO DIGITAL GAMING // BUY CHEAP PC GAME KEYS ONLINE", themeColor: "#f97316" }, activeGamivo.map(createPromoCard))
                    ),
                    React.createElement("div", { className: "section-label" }, "🏆 Hero Products — Top Picks"),
                    React.createElement("div", { className: "grid" }, activeHero.map(createPromoCard)),
                    React.createElement("div", { className: "section-label" }, "⚡ Core Affiliate Ledger"),
                    React.createElement("div", { className: "grid" }, activeCore.map(createPromoCard))
                ) : React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "section-label" }, `⚡ FILTERED RESULTS: ${activeTab}`),
                    React.createElement("div", { className: "grid" }, displayedCards.map(createPromoCard))
                )
            ),
            toast && React.createElement("div", { className: "cyber-toast" }, React.createElement("span", null, "✅"), toast)
        )
    );
}

