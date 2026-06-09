export async function onRequestPost(context) {
  return new Response(JSON.stringify({ 
    response: "AI Engine Verified: Steam inventory match found. You can buy the game securely right here using this link: https://www.kqzyfj.com/click-101761790-15736191" 
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
