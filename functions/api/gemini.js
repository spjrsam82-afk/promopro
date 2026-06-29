export async function onRequestPost(context) {
  try {
    const { prompt } = await context.request.json();

    const apiKey = context.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    return Response.json(data);

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}