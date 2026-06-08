export default async (req, context) => {
  try {
    const requestBody = await req.json();
    const { game, code } = requestBody;

    if (!game || !code) {
      return new Response(JSON.stringify({ response: "System Error: Missing target game or code parameters." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ response: "System Error: AI Engine Key missing from environment configurations." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const PRODUCT_FEEDS = [
      "https://raw.githubusercontent.com/spjrsam82-afk/promopro/main/gamivo-feed.csv"
    ];

    let aggregatedFeedData = "";

    for (const feedUrl of PRODUCT_FEEDS) {
      try {
        const response = await fetch(feedUrl);
        if (response.ok) {
          const textData = await response.text();
          
          const matchedLines = textData
            .split('\n')
            .filter(line => {
              const cleanLine = line.replace(/[\r\n]/g, '').trim().toLowerCase();
              const cleanGame = game.trim().toLowerCase();
              return cleanLine.includes(cleanGame);
            })
            .join('\n');

          if (matchedLines.trim().length > 0) {
            aggregatedFeedData += `${matchedLines}\n`;
          }
        }
      } catch (feedError) {
        console.error(`Skipping feed connection error on URL: ${feedUrl}`);
      }
    }

    if (!aggregatedFeedData.trim()) {
      aggregatedFeedData = `No active inventory data matched the exact string "${game}" within our system files.`;
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are the PromoPro AI verification engine. Your job is to verify if a promo code matches our active inventory profiles.
            
Live Inventory Feed Snippets:
"""
${aggregatedFeedData}
"""

User Request:
Target Game: ${game}
Submitted Promo Code: ${code}

Analyze the feed data. Provide a precise, direct, and concise verdict on whether this promotional code applies to the game requested. 

CRITICAL: If the game is found in the inventory, always append a message at the absolute end of your response telling the user they can buy the game securely right here using this exact link: https://www.kqzyfj.com/click-101761790-15736191`
          }]
        }]
      })
    });

    const aiData = await geminiResponse.json();
    const systemResponseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "The verification engine timed out. Please try again.";

    return new Response(JSON.stringify({ response: systemResponseText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (globalError) {
    return new Response(JSON.stringify({ response: `Critical Error: Master code exception occurred. Details: ${globalError.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
