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
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are PromoPro AI. The user searched for: "${searchInput}". Return ONLY valid JSON: {"title":"","description":"","image_search":""}. Rules: title=brand/product, description=short affiliate response, image_search=best search phrase. Do not include markdown. Only return JSON.`
                        }]
                    }]
                })
            });

            const data = await response.json();

            // FIXED: Target the exact location of the text in Google's API response
            let rawAiText = data.candidates[0].content.parts[0].text;

            // SAFETY STRIP: Removes markdown backticks if the AI includes them
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
